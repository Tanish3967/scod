package processor

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"sync/atomic"
	"time"

	"github.com/signflow/document-processor/queue"
)

type JobStatus string

const (
	JobStatusQueued     JobStatus = "queued"
	JobStatusProcessing JobStatus = "processing"
	JobStatusCompleted  JobStatus = "completed"
	JobStatusFailed     JobStatus = "failed"
)

type PDFJob struct {
	ID                 string                 `json:"id"`
	EnvelopeID         string                 `json:"envelope_id"`
	DocumentID         string                 `json:"document_id"`
	TotalPages         int                    `json:"total_pages"`
	Status             JobStatus              `json:"status"`
	Sha256ResultHash   string                 `json:"sha256_result_hash,omitempty"`
	StorageBlobURI     string                 `json:"storage_blob_uri,omitempty"`
	ProcessingDuration string                 `json:"processing_duration,omitempty"`
	CreatedAt          time.Time              `json:"created_at"`
	CompletedAt        *time.Time             `json:"completed_at,omitempty"`
	ErrorMessage       string                 `json:"error_message,omitempty"`
}

// WorkerPool manages parallel Go goroutine workers processing event queue jobs
type WorkerPool struct {
	mu             sync.RWMutex
	concurrency    int
	eventBus       *queue.EventBus
	jobs           map[string]*PDFJob
	activeWorkers  int32
	completedJobs  uint64
	failedJobs     uint64
	stopChan       chan struct{}
}

func NewWorkerPool(concurrency int, eventBus *queue.EventBus) *WorkerPool {
	if concurrency <= 0 {
		concurrency = 64 // 64 parallel PDF rendering workers
	}

	wp := &WorkerPool{
		concurrency: concurrency,
		eventBus:    eventBus,
		jobs:        make(map[string]*PDFJob),
		stopChan:    make(chan struct{}),
	}

	wp.startWorkers()
	return wp
}

func (wp *WorkerPool) startWorkers() {
	rasterizeCh, _ := wp.eventBus.Subscribe(queue.TopicDocumentRasterize)
	completedCh, _ := wp.eventBus.Subscribe(queue.TopicEnvelopeCompleted)

	for i := 0; i < wp.concurrency; i++ {
		go func(workerID int) {
			for {
				select {
				case <-wp.stopChan:
					return
				case msg := <-rasterizeCh:
					wp.processMessage(msg)
				case msg := <-completedCh:
					wp.processMessage(msg)
				}
			}
		}(i)
	}
}

func (wp *WorkerPool) processMessage(msg *queue.EventMessage) {
	if msg == nil {
		return
	}

	atomic.AddInt32(&wp.activeWorkers, 1)
	defer atomic.AddInt32(&wp.activeWorkers, -1)

	wp.mu.Lock()
	job, exists := wp.jobs[msg.ID]
	if !exists {
		job = &PDFJob{
			ID:         msg.ID,
			EnvelopeID: msg.EnvelopeID,
			DocumentID: msg.DocumentID,
			TotalPages: 4,
			Status:     JobStatusProcessing,
			CreatedAt:  msg.CreatedAt,
		}
		wp.jobs[msg.ID] = job
	} else {
		job.Status = JobStatusProcessing
	}
	wp.mu.Unlock()

	start := time.Now()

	// High-speed simulated PDF rasterization, watermark overlay, & Merkle seal hash computation
	hashInput := fmt.Sprintf("%s:%s:%d:%d", msg.EnvelopeID, msg.DocumentID, job.TotalPages, time.Now().UnixNano())
	digest := sha256.Sum256([]byte(hashInput))
	finalHash := "sha256-" + hex.EncodeToString(digest[:])
	blobURI := fmt.Sprintf("https://storage.signflow.internal/sealed-vault/env-%s/doc-%s.pdf", msg.EnvelopeID, msg.DocumentID)

	duration := time.Since(start)
	now := time.Now()

	wp.mu.Lock()
	job.Status = JobStatusCompleted
	job.Sha256ResultHash = finalHash
	job.StorageBlobURI = blobURI
	job.ProcessingDuration = fmt.Sprintf("%v", duration)
	job.CompletedAt = &now
	wp.mu.Unlock()

	atomic.AddUint64(&wp.completedJobs, 1)
}

// SubmitJob queues a new asynchronous PDF rendering & sealing job
func (wp *WorkerPool) SubmitJob(envelopeID, documentID string, totalPages int) (*PDFJob, error) {
	jobID := fmt.Sprintf("job-%d", time.Now().UnixNano())

	if totalPages <= 0 {
		totalPages = 4
	}

	job := &PDFJob{
		ID:         jobID,
		EnvelopeID: envelopeID,
		DocumentID: documentID,
		TotalPages: totalPages,
		Status:     JobStatusQueued,
		CreatedAt:  time.Now().UTC(),
	}

	wp.mu.Lock()
	wp.jobs[jobID] = job
	wp.mu.Unlock()

	// Dispatch to EventBus
	msg := &queue.EventMessage{
		ID:         jobID,
		Topic:      queue.TopicDocumentRasterize,
		EnvelopeID: envelopeID,
		DocumentID: documentID,
		CreatedAt:  time.Now().UTC(),
		Payload: map[string]interface{}{
			"total_pages": totalPages,
		},
	}

	if err := wp.eventBus.Publish(msg); err != nil {
		wp.mu.Lock()
		job.Status = JobStatusFailed
		job.ErrorMessage = err.Error()
		wp.mu.Unlock()
		atomic.AddUint64(&wp.failedJobs, 1)
		return job, err
	}

	return job, nil
}

// GetJobStatus returns the status of an async job
func (wp *WorkerPool) GetJobStatus(jobID string) (*PDFJob, bool) {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	job, exists := wp.jobs[jobID]
	return job, exists
}

// GetTelemetry returns live worker pool telemetry
func (wp *WorkerPool) GetTelemetry() map[string]interface{} {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return map[string]interface{}{
		"concurrency_limit": wp.concurrency,
		"active_workers":    atomic.LoadInt32(&wp.activeWorkers),
		"completed_jobs":    atomic.LoadUint64(&wp.completedJobs),
		"failed_jobs":       atomic.LoadUint64(&wp.failedJobs),
		"total_jobs_seen":   len(wp.jobs),
		"worker_strategy":   "Async Event-Driven Goroutine Pool (Kafka-compatible)",
	}
}
