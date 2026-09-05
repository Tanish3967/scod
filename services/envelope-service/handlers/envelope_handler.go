package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/signflow/envelope-service/cache"
	"github.com/signflow/envelope-service/models"
	"github.com/signflow/envelope-service/sharding"
	"github.com/signflow/envelope-service/statemachine"
)

type EnvelopeStore struct {
	mu        sync.RWMutex
	envelopes map[string]*models.Envelope
	dbPath    string
}

func (s *EnvelopeStore) persistToDisk() {
	if s.dbPath == "" {
		return
	}
	_ = os.MkdirAll(filepath.Dir(s.dbPath), 0755)
	data, err := json.MarshalIndent(s.envelopes, "", "  ")
	if err == nil {
		_ = os.WriteFile(s.dbPath, data, 0644)
	}
}

func (s *EnvelopeStore) loadFromDisk() bool {
	if s.dbPath == "" {
		return false
	}
	data, err := os.ReadFile(s.dbPath)
	if err != nil {
		return false
	}
	var loaded map[string]*models.Envelope
	if err := json.Unmarshal(data, &loaded); err == nil && len(loaded) > 0 {
		s.envelopes = loaded
		return true
	}
	return false
}

func (s *EnvelopeStore) Count() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.envelopes)
}

func NewEnvelopeStore() *EnvelopeStore {
	store := &EnvelopeStore{
		envelopes: make(map[string]*models.Envelope),
		dbPath:    "data/local_envelopes_db.json",
	}

	// Try loading from local disk database
	if !store.loadFromDisk() {
		// Seed demo envelope
		store.envelopes["env-demo-001"] = &models.Envelope{
			ID:    "env-demo-001",
			Title: "Enterprise SaaS Master Agreement",
			Sender: models.EnvelopeSender{
				Name:         "Sarah Jenkins",
				Email:        "sarah.j@signflow.ai",
				Organization: "Acme Global Inc",
			},
			Status:    models.StatusSent,
			CreatedAt: time.Now().Add(-24 * time.Hour),
			UpdatedAt: time.Now(),
			ExpiresAt: time.Now().Add(30 * 24 * time.Hour),
			Recipients: []models.Recipient{
				{
					ID:           "rec-1",
					Name:         "David Vance",
					Email:        "d.vance@acme.com",
					Role:         models.RoleSigner,
					RoutingOrder: 1,
					AuthType:     models.AuthSMSOTP,
					Status:       "ready",
				},
			},
			Tags: []string{"Enterprise", "SaaS"},
		}
		store.persistToDisk()
	}

	return store
}

type EnvelopeHandler struct {
	store       *EnvelopeStore
	cacheEngine *cache.MultiTierCache
	shardRouter *sharding.ShardRouter
}

func NewEnvelopeHandler(store *EnvelopeStore, cacheEngine *cache.MultiTierCache, shardRouter *sharding.ShardRouter) *EnvelopeHandler {
	return &EnvelopeHandler{
		store:       store,
		cacheEngine: cacheEngine,
		shardRouter: shardRouter,
	}
}

// ListEnvelopes returns all envelopes with optional filtering
func (h *EnvelopeHandler) ListEnvelopes(w http.ResponseWriter, r *http.Request) {
	h.store.mu.RLock()
	defer h.store.mu.RUnlock()

	status := r.URL.Query().Get("status")
	result := make([]*models.Envelope, 0, len(h.store.envelopes))

	for _, env := range h.store.envelopes {
		if status != "" && string(env.Status) != status {
			continue
		}
		result = append(result, env)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Shard-Mesh-Status", "Active-Distributed")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"count":     len(result),
		"envelopes": result,
	})
}

// GetEnvelope retrieves a single envelope by ID with multi-tier cache & shard routing
func (h *EnvelopeHandler) GetEnvelope(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/envelopes/")
	if id == "" {
		http.Error(w, `{"error":"missing envelope ID"}`, http.StatusBadRequest)
		return
	}

	tenantID := r.Header.Get("X-Tenant-ID")
	if tenantID == "" {
		tenantID = "tenant-global-default"
	}

	// Compute assigned shard node
	shardNode, shardIdx := h.shardRouter.RouteEnvelope(tenantID, id)
	w.Header().Set("X-Shard-ID", fmt.Sprintf("shard-%02d", shardIdx))
	w.Header().Set("X-Shard-Region", shardNode.Region)

	// Check Multi-Tier Cache (L1 in-memory -> L2 Redis cluster)
	if cachedEnv, status := h.cacheEngine.GetEnvelope(id); status != cache.CacheMiss {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache-Status", string(status))
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":      true,
			"cache_status": string(status),
			"shard_id":     fmt.Sprintf("shard-%02d", shardIdx),
			"envelope":     cachedEnv,
		})
		return
	}

	// Database query fallback (Cache Miss)
	h.store.mu.RLock()
	env, exists := h.store.envelopes[id]
	h.store.mu.RUnlock()

	if !exists {
		http.Error(w, `{"error":"envelope not found"}`, http.StatusNotFound)
		return
	}

	// Store in multi-tier cache for subsequent sub-millisecond reads
	_ = h.cacheEngine.SetEnvelope(env, 30*time.Minute)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Cache-Status", string(cache.CacheMiss))
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"cache_status": string(cache.CacheMiss),
		"shard_id":     fmt.Sprintf("shard-%02d", shardIdx),
		"envelope":     env,
	})
}

// CreateEnvelope creates a new draft envelope and seeds shard & cache
func (h *EnvelopeHandler) CreateEnvelope(w http.ResponseWriter, r *http.Request) {
	var req models.Envelope
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid JSON payload"}`, http.StatusBadRequest)
		return
	}

	if req.ID == "" {
		req.ID = "env-" + time.Now().Format("20060102150405")
	}
	req.Status = models.StatusDraft
	req.CreatedAt = time.Now()
	req.UpdatedAt = time.Now()
	if req.ExpiresAt.IsZero() {
		req.ExpiresAt = time.Now().Add(30 * 24 * time.Hour)
	}

	tenantID := r.Header.Get("X-Tenant-ID")
	if tenantID == "" {
		tenantID = "tenant-global-default"
	}

	shardNode, shardIdx := h.shardRouter.RouteEnvelope(tenantID, req.ID)

	h.store.mu.Lock()
	h.store.envelopes[req.ID] = &req
	h.store.persistToDisk()
	h.store.mu.Unlock()

	// Invalidate and pre-warm cache
	_ = h.cacheEngine.SetEnvelope(&req, 30*time.Minute)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Shard-ID", fmt.Sprintf("shard-%02d", shardIdx))
	w.Header().Set("X-Shard-Region", shardNode.Region)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"message":  "Envelope draft created successfully",
		"shard_id": fmt.Sprintf("shard-%02d", shardIdx),
		"envelope": req,
	})
}

// UpdateEnvelopeStatus transitions state and invalidates cache
func (h *EnvelopeHandler) UpdateEnvelopeStatus(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/envelopes/")
	id = strings.TrimSuffix(id, "/status")

	var req struct {
		TargetStatus models.EnvelopeStatus `json:"targetStatus"`
		Actor        string                `json:"actor"`
		Reason       string                `json:"reason"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid JSON payload"}`, http.StatusBadRequest)
		return
	}

	h.store.mu.Lock()
	defer h.store.mu.Unlock()

	env, exists := h.store.envelopes[id]
	if !exists {
		http.Error(w, `{"error":"envelope not found"}`, http.StatusNotFound)
		return
	}

	// Validate state machine transition
	if err := statemachine.ValidateTransition(env, req.TargetStatus); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   err.Error(),
			"from":    env.Status,
			"to":      req.TargetStatus,
		})
		return
	}

	env.Status = req.TargetStatus
	env.UpdatedAt = time.Now()
	h.store.persistToDisk()
	if req.TargetStatus == models.StatusCompleted {
		now := time.Now()
		env.CompletedAt = &now
	}

	// Invalidate previous cache and write new version
	h.cacheEngine.Invalidate(id)
	_ = h.cacheEngine.SetEnvelope(env, 30*time.Minute)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"message":  "Status transitioned to " + string(req.TargetStatus),
		"envelope": env,
	})
}

// GetShardingTopology returns the current cluster topology
func (h *EnvelopeHandler) GetShardingTopology(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(h.shardRouter.GetTopologySummary())
}

// GetCacheTelemetry returns real-time multi-tier cache telemetry
func (h *EnvelopeHandler) GetCacheTelemetry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(h.cacheEngine.GetTelemetry())
}
