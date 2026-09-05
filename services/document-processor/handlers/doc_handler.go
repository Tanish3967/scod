package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/signflow/document-processor/processor"
)

type DocHandler struct{}

func NewDocHandler() *DocHandler {
	return &DocHandler{}
}

// ProcessDocument processes uploaded text, computes checksums, and detects signature lines
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
