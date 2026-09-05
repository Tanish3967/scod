package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/signflow/envelope-service/models"
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
	store *EnvelopeStore
}

func NewEnvelopeHandler(store *EnvelopeStore) *EnvelopeHandler {
	return &EnvelopeHandler{store: store}
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
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"count":     len(result),
		"envelopes": result,
	})
}

// GetEnvelope retrieves a single envelope by ID
func (h *EnvelopeHandler) GetEnvelope(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/envelopes/")
	if id == "" {
		http.Error(w, `{"error":"missing envelope ID"}`, http.StatusBadRequest)
		return
	}

	h.store.mu.RLock()
	env, exists := h.store.envelopes[id]
	h.store.mu.RUnlock()

	if !exists {
		http.Error(w, `{"error":"envelope not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"envelope": env,
	})
}

// CreateEnvelope creates a new draft envelope
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

	h.store.mu.Lock()
	h.store.envelopes[req.ID] = &req
	h.store.persistToDisk()
	h.store.mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"message":  "Envelope draft created successfully",
		"envelope": req,
	})
}

// UpdateEnvelopeStatus transitions the envelope lifecycle state
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"message":  "Status transitioned to " + string(req.TargetStatus),
		"envelope": env,
	})
}
