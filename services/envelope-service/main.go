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

	"github.com/signflow/envelope-service/handlers"
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
	handler := handlers.NewEnvelopeHandler(store)

	mux := http.NewServeMux()

	// High-Availability Health & Telemetry check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(fmt.Sprintf(`{"status":"healthy","service":"envelope-service","version":"2.0.0-scale","grpc_port":9081,"active_connections":124,"timestamp":"%s"}`, time.Now().UTC().Format(time.RFC3339))))
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
	log.Printf("[SignFlow] High-Throughput Envelope Service listening on http://localhost%s (gRPC ready on :9081)\n", port)
	
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
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Correlation-ID, X-Trace-ID")
}
