package sharding

import (
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"sync"
)

// ShardNode represents a physical or virtual database cluster node
type ShardNode struct {
	ID          string `json:"id"`
	Region      string `json:"region"`
	Host        string `json:"host"`
	Port        int    `json:"port"`
	IsPrimary   bool   `json:"is_primary"`
	HealthScore float64 `json:"health_score"`
}

// ShardRouter manages consistent hashing and shard assignment for 100M+ scale
type ShardRouter struct {
	mu         sync.RWMutex
	numShards  int
	nodes      map[int]*ShardNode
	tenantMap  map[string]int // Dedicated enterprise tenant pinned shards
}

func NewShardRouter(numShards int) *ShardRouter {
	if numShards <= 0 {
		numShards = 16 // Default 16 physical shards
	}

	router := &ShardRouter{
		numShards: numShards,
		nodes:     make(map[int]*ShardNode),
		tenantMap: make(map[string]int),
	}

	// Initialize default partition topology across 3 global regions
	regions := []string{"us-east-1", "eu-central-1", "ap-southeast-1"}
	for i := 0; i < numShards; i++ {
		region := regions[i%len(regions)]
		router.nodes[i] = &ShardNode{
			ID:          fmt.Sprintf("shard-%02d", i),
			Region:      region,
			Host:        fmt.Sprintf("db-%s-node-%02d.signflow.internal", region, i),
			Port:        5432 + i,
			IsPrimary:   true,
			HealthScore: 100.0,
		}
	}

	return router
}

// JumpHash is a fast, memory-free consistent hash algorithm (Google Jump Consistent Hash)
func JumpHash(key uint64, numBuckets int) int {
	var b int64 = -1
	var j int64 = 0
	for j < int64(numBuckets) {
		b = j
		key = key*2862933555777941757 + 1
		j = int64(float64(b+1) * (float64(int64(1)<<31) / float64((key>>33)+1)))
	}
	return int(b)
}

// GetShardKey returns the 64-bit integer hash from a string key (tenantId + envelopeId)
func GetHashKey(key string) uint64 {
	h := sha256.Sum256([]byte(key))
	return binary.BigEndian.Uint64(h[0:8])
}

// RouteEnvelope routes an envelope to its designated shard based on tenant isolation or consistent hash
func (r *ShardRouter) RouteEnvelope(tenantID string, envelopeID string) (*ShardNode, int) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	// 1. Dedicated Enterprise Tenant Pinning
	if shardIdx, exists := r.tenantMap[tenantID]; exists {
		if node, ok := r.nodes[shardIdx]; ok {
			return node, shardIdx
		}
	}

	// 2. Uniform Consistent Hashing by combined composite key
	compositeKey := fmt.Sprintf("%s:%s", tenantID, envelopeID)
	hashKey := GetHashKey(compositeKey)
	shardIdx := JumpHash(hashKey, r.numShards)

	node := r.nodes[shardIdx]
	return node, shardIdx
}

// PinTenantToShard pins an enterprise tenant to a dedicated compliant shard (e.g. EU data residency)
func (r *ShardRouter) PinTenantToShard(tenantID string, shardIdx int) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if shardIdx < 0 || shardIdx >= r.numShards {
		return fmt.Errorf("invalid shard index: %d (max: %d)", shardIdx, r.numShards-1)
	}

	r.tenantMap[tenantID] = shardIdx
	return nil
}

// GetTopologySummary returns the current distribution metadata
func (r *ShardRouter) GetTopologySummary() map[string]interface{} {
	r.mu.RLock()
	defer r.mu.RUnlock()

	return map[string]interface{}{
		"total_shards":    r.numShards,
		"algorithm":       "Jump Consistent Hash (Google) + Tenant Shard Pinning",
		"pinned_tenants":  len(r.tenantMap),
		"global_regions":  []string{"us-east-1", "eu-central-1", "ap-southeast-1"},
		"status":          "Active",
	}
}
