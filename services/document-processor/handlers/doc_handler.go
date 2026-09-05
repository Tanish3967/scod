package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/signflow/document-processor/processor"
	"github.com/signflow/document-processor/queue"
)

type DocHandler struct {
	workerPool *processor.WorkerPool
	eventBus   *queue.EventBus
}

func NewDocHandler(workerPool *processor.WorkerPool, eventBus *queue.EventBus) *DocHandler {
	return &DocHandler{
		workerPool: workerPool,
		eventBus:   eventBus,
	}
}

// ProcessDocument processes uploaded text, computes checksums, and detects signature lines (Synchronous)
func (h *DocHandler) ProcessDocument(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name       string `json:"name"`
		Content    string `json:"content"`
		TotalPages int    `json:"totalPages"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if req.TotalPages <= 0 {
		req.TotalPages = 1
	}

	hash := processor.ComputeSHA256([]byte(req.Content))
	detected := processor.AutoDetectFields(req.Content, req.TotalPages)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":        true,
		"documentName":   req.Name,
		"sha256Checksum": hash,
		"fieldsCount":    len(detected),
		"detectedFields": detected,
	})
}

// SubmitAsyncJob dispatches a long-running PDF rendering/sealing job to the asynchronous worker pool
func (h *DocHandler) SubmitAsyncJob(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EnvelopeID string `json:"envelopeId"`
		DocumentID string `json:"documentId"`
		TotalPages int    `json:"totalPages"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid JSON payload"}`, http.StatusBadRequest)
		return
	}

	if req.EnvelopeID == "" {
		req.EnvelopeID = "env-default"
	}
	if req.DocumentID == "" {
		req.DocumentID = "doc-default"
	}

	job, err := h.workerPool.SubmitJob(req.EnvelopeID, req.DocumentID, req.TotalPages)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   err.Error(),
			"job":     job,
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted) // 202 Accepted
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Job accepted and queued for asynchronous execution",
		"job":     job,
	})
}

// GetJobStatus retrieves the real-time processing status of a queued background job
func (h *DocHandler) GetJobStatus(w http.ResponseWriter, r *http.Request) {
	jobID := strings.TrimPrefix(r.URL.Path, "/api/v1/jobs/")
	if jobID == "" {
		http.Error(w, `{"error":"missing job ID"}`, http.StatusBadRequest)
		return
	}

	job, exists := h.workerPool.GetJobStatus(jobID)
	if !exists {
		http.Error(w, `{"error":"job not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"job":     job,
	})
}

// GetWorkerStats returns worker concurrency and queue depth telemetry
func (h *DocHandler) GetWorkerStats(w http.ResponseWriter, r *http.Request) {
	workerStats := h.workerPool.GetTelemetry()
	queueStats := h.eventBus.GetMetrics()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"worker_pool":  workerStats,
		"event_stream": queueStats,
	})
}
