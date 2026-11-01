package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/signflow/envelope-service/cache"
	"github.com/signflow/envelope-service/handlers"
	"github.com/signflow/envelope-service/sharding"
)

// Middleware to inject distributed tracing correlation IDs for 100M-scale observability
func withTracing(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		correlationID := r.Header.Get("X-Correlation-ID")
		if correlationID == "" {
			b := make([]byte, 16)
			rand.Read(b)
			correlationID = "trace-" + hex.EncodeToString(b)
		}

		w.Header().Set("X-Correlation-ID", correlationID)
		w.Header().Set("X-Service-Instance", "envelope-svc-node-01")

		ctx := context.WithValue(r.Context(), "correlationID", correlationID)
		next.ServeHTTP(w, r.WithContext(ctx))

		duration := time.Since(start)
		if duration > 100*time.Millisecond {
			log.Printf("[SLOW QUERY] %s %s [%s] took %v\n", r.Method, r.URL.Path, correlationID, duration)
		}
	})
}

func main() {
	store := handlers.NewEnvelopeStore()
	cacheEngine := cache.NewMultiTierCache(20000, 30*time.Minute) // 20k L1 hot items in RAM
	shardRouter := sharding.NewShardRouter(16)                   // 16 physical shard partitions

	handler := handlers.NewEnvelopeHandler(store, cacheEngine, shardRouter)

	mux := http.NewServeMux()

	// High-Availability Health & Telemetry check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(fmt.Sprintf(`{"status":"healthy","service":"envelope-service","version":"2.0.0-scale","grpc_port":9081,"shards_active":16,"cache_tier":"L1+L2","timestamp":"%s"}`, time.Now().UTC().Format(time.RFC3339))))
	})

	// Standardized Prometheus Metrics Exporter
	mux.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		w.Header().Set("Content-Type", "text/plain; version=0.0.4")
		telemetry := cacheEngine.GetTelemetry()
		l1Items, _ := telemetry["l1_items_in_ram"].(int)
		metrics := fmt.Sprintf(`# HELP signflow_envelope_shards_total Total physical consistent hash shards
# TYPE signflow_envelope_shards_total gauge
signflow_envelope_shards_total 16

# HELP signflow_cache_l1_items Current hot items in RAM cache
# TYPE signflow_cache_l1_items gauge
signflow_cache_l1_items %d

# HELP signflow_envelope_total_stored Total envelopes managed in storage
# TYPE signflow_envelope_total_stored gauge
signflow_envelope_total_stored %d

# HELP signflow_service_health Service health status (1 = healthy)
# TYPE signflow_service_health gauge
signflow_service_health{service="envelope-service"} 1
`, l1Items, store.Count())
		w.Write([]byte(metrics))
	})

	// Shard Topology Endpoint
	mux.HandleFunc("/api/v1/shards/topology", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		handler.GetShardingTopology(w, r)
	})

	// Multi-Tier Cache Telemetry Endpoint
	mux.HandleFunc("/api/v1/cache/telemetry", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		handler.GetCacheTelemetry(w, r)
	})

	// Velocity Funnel Analytics Endpoint
	mux.HandleFunc("/api/v1/analytics/funnel", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		handler.GetVelocityFunnel(w, r)
	})

	// Envelope routes
	mux.HandleFunc("/api/v1/envelopes", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodGet {
			handler.ListEnvelopes(w, r)
		} else if r.Method == http.MethodPost {
			handler.CreateEnvelope(w, r)
		} else {
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/v1/envelopes/", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if strings.HasSuffix(r.URL.Path, "/status") && r.Method == http.MethodPost {
			handler.UpdateEnvelopeStatus(w, r)
			return
		}
		if r.Method == http.MethodGet {
			handler.GetEnvelope(w, r)
			return
		}
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
	})

	port := ":8081"
	log.Printf("[SignFlow] Phase 2 Sharded & Cached Envelope Service listening on http://localhost%s (16 Shards, L1/L2 Cache)\n", port)
	
	server := &http.Server{
		Addr:         port,
		Handler:      withTracing(mux),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Correlation-ID, X-Trace-ID, X-Tenant-ID")
}
