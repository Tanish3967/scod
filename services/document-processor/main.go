package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/signflow/document-processor/handlers"
	"github.com/signflow/document-processor/processor"
	"github.com/signflow/document-processor/queue"
)

// Middleware for PDF worker telemetry & tracing
func withDocTracing(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		correlationID := r.Header.Get("X-Correlation-ID")
		if correlationID == "" {
			b := make([]byte, 16)
			rand.Read(b)
			correlationID = "doc-trace-" + hex.EncodeToString(b)
		}

		w.Header().Set("X-Correlation-ID", correlationID)
		w.Header().Set("X-Worker-Pool", "go-rasterizer-v2")

		ctx := context.WithValue(r.Context(), "correlationID", correlationID)
		next.ServeHTTP(w, r.WithContext(ctx))

		duration := time.Since(start)
		if duration > 100*time.Millisecond {
			log.Printf("[PDF WORKER METRIC] %s %s [%s] processed in %v\n", r.Method, r.URL.Path, correlationID, duration)
		}
	})
}

func main() {
	eventBus := queue.NewEventBus(50000)
	workerPool := processor.NewWorkerPool(64, eventBus)
	handler := handlers.NewDocHandler(workerPool, eventBus)

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(fmt.Sprintf(`{"status":"healthy","service":"document-processor","version":"2.0.0-scale","grpc_port":9083,"worker_concurrency":64,"timestamp":"%s"}`, time.Now().UTC().Format(time.RFC3339))))
	})

	// Standardized Prometheus Metrics Exporter
	mux.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		w.Header().Set("Content-Type", "text/plain; version=0.0.4")
		poolStats := workerPool.GetTelemetry()
		concurrency, _ := poolStats["concurrency_limit"].(int)
		completed, _ := poolStats["completed_jobs"].(uint64)
		failed, _ := poolStats["failed_jobs"].(uint64)
		active, _ := poolStats["active_workers"].(int32)
		metrics := fmt.Sprintf(`# HELP signflow_pdf_worker_concurrency Parallel Go worker goroutines limit
# TYPE signflow_pdf_worker_concurrency gauge
signflow_pdf_worker_concurrency %d

# HELP signflow_pdf_worker_active Active worker goroutines
# TYPE signflow_pdf_worker_active gauge
signflow_pdf_worker_active %d

# HELP signflow_pdf_jobs_completed_total Total background rendering and sealing jobs completed
# TYPE signflow_pdf_jobs_completed_total counter
signflow_pdf_jobs_completed_total %d

# HELP signflow_pdf_jobs_failed_total Total failed rendering jobs
# TYPE signflow_pdf_jobs_failed_total counter
signflow_pdf_jobs_failed_total %d

# HELP signflow_service_health Service health status (1 = healthy)
# TYPE signflow_service_health gauge
signflow_service_health{service="document-processor"} 1
`, concurrency, active, completed, failed)
		w.Write([]byte(metrics))
	})

	mux.HandleFunc("/api/v1/documents/process", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodPost {
			handler.ProcessDocument(w, r)
			return
		}
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
	})

	mux.HandleFunc("/api/v1/jobs/submit", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodPost {
			handler.SubmitAsyncJob(w, r)
			return
		}
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
	})

	mux.HandleFunc("/api/v1/jobs/", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodGet {
			handler.GetJobStatus(w, r)
			return
		}
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
	})

	mux.HandleFunc("/api/v1/workers/stats", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodGet {
			handler.GetWorkerStats(w, r)
			return
		}
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
	})

	port := ":8083"
	log.Printf("[SignFlow] High-Throughput PDF Processor listening on http://localhost%s (64 async workers, EventBus active)\n", port)

	server := &http.Server{
		Addr:         port,
		Handler:      withDocTracing(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
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
