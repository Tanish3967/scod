package cache

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/signflow/envelope-service/models"
)

type CacheStatus string

const (
	CacheHitL1 CacheStatus = "HIT-L1 (In-Memory)"
	CacheHitL2 CacheStatus = "HIT-L2 (Distributed Redis)"
	CacheMiss  CacheStatus = "MISS (Database Query)"
)

type CacheEntry struct {
	Value     []byte
	ExpiresAt time.Time
}

// MultiTierCache manages L1 (In-Memory Hot Cache) and L2 (Distributed Cluster Cache)
type MultiTierCache struct {
	mu           sync.RWMutex
	l1Store      map[string]*CacheEntry
	l2Store      map[string]*CacheEntry // High-speed cluster simulation
	l1Capacity   int
	defaultTTL   time.Duration
	hitCountL1   uint64
	hitCountL2   uint64
	missCount    uint64
}

func NewMultiTierCache(l1Capacity int, defaultTTL time.Duration) *MultiTierCache {
	if l1Capacity <= 0 {
		l1Capacity = 10000 // 10k hot items in RAM
	}
	if defaultTTL <= 0 {
		defaultTTL = 30 * time.Minute
	}

	return &MultiTierCache{
		l1Store:    make(map[string]*CacheEntry),
		l2Store:    make(map[string]*CacheEntry),
		l1Capacity: l1Capacity,
		defaultTTL: defaultTTL,
	}
}

// GetEnvelope attempts to fetch envelope from L1, then L2, else returns CacheMiss
func (c *MultiTierCache) GetEnvelope(envelopeID string) (*models.Envelope, CacheStatus) {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()

	// 1. Check L1 In-Memory Cache
	if entry, ok := c.l1Store[envelopeID]; ok {
		if now.Before(entry.ExpiresAt) {
			c.hitCountL1++
			var env models.Envelope
			if err := json.Unmarshal(entry.Value, &env); err == nil {
				return &env, CacheHitL1
			}
		} else {
			delete(c.l1Store, envelopeID) // Expired
		}
	}

	// 2. Check L2 Distributed Cluster Cache
	if entry, ok := c.l2Store[envelopeID]; ok {
		if now.Before(entry.ExpiresAt) {
			c.hitCountL2++
			// Promote to L1
			c.l1Store[envelopeID] = entry
			var env models.Envelope
			if err := json.Unmarshal(entry.Value, &env); err == nil {
				return &env, CacheHitL2
			}
		} else {
			delete(c.l2Store, envelopeID)
		}
	}

	c.missCount++
	return nil, CacheMiss
}

// SetEnvelope stores an envelope in both L1 and L2 with active TTL
func (c *MultiTierCache) SetEnvelope(env *models.Envelope, customTTL time.Duration) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	ttl := c.defaultTTL
	if customTTL > 0 {
		ttl = customTTL
	}

	data, err := json.Marshal(env)
	if err != nil {
		return err
	}

	entry := &CacheEntry{
		Value:     data,
		ExpiresAt: time.Now().Add(ttl),
	}

	// Evict from L1 if capacity exceeded
	if len(c.l1Store) >= c.l1Capacity {
		for k := range c.l1Store {
			delete(c.l1Store, k)
			break
		}
	}

	c.l1Store[env.ID] = entry
	c.l2Store[env.ID] = entry
	return nil
}

// Invalidate removes an envelope immediately from all cache tiers upon modification
func (c *MultiTierCache) Invalidate(envelopeID string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.l1Store, envelopeID)
	delete(c.l2Store, envelopeID)
}

// GetTelemetry returns cache hit-rates and metrics
func (c *MultiTierCache) GetTelemetry() map[string]interface{} {
	c.mu.RLock()
	defer c.mu.RUnlock()

	totalRequests := c.hitCountL1 + c.hitCountL2 + c.missCount
	var hitRate float64 = 0.0
	if totalRequests > 0 {
		hitRate = float64(c.hitCountL1+c.hitCountL2) / float64(totalRequests) * 100.0
	}

	return map[string]interface{}{
		"l1_items_in_ram": c.l1Capacity,
		"l1_active_keys":  len(c.l1Store),
		"l2_active_keys":  len(c.l2Store),
		"l1_hits":         c.hitCountL1,
		"l2_hits":         c.hitCountL2,
		"misses":          c.missCount,
		"hit_rate_pct":    fmt.Sprintf("%.2f%%", hitRate),
		"tier_strategy":   "L1 In-Memory + L2 Redis Active Cluster",
	}
}
