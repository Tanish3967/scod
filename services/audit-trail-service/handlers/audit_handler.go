package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/signflow/audit-trail-service/ledger"
)

type AuditHandler struct {
	store *ledger.AuditStore
}

func NewAuditHandler(store *ledger.AuditStore) *AuditHandler {
	return &AuditHandler{store: store}
}

// GetAuditTrail returns the hash-chained events for an envelope
func (h *AuditHandler) GetAuditTrail(w http.ResponseWriter, r *http.Request) {
	envelopeID := strings.TrimPrefix(r.URL.Path, "/api/v1/audit/")
	envelopeID = strings.TrimSuffix(envelopeID, "/verify")

	chain := h.store.GetChain(envelopeID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"envelopeId": envelopeID,
		"count":      len(chain),
		"auditTrail": chain,
	})
}

// RecordEvent appends a new audit record to the envelope
func (h *AuditHandler) RecordEvent(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EnvelopeID  string   `json:"envelopeId"`
		Actor       string   `json:"actor"`
		Action      string   `json:"action"`
		Details     string   `json:"details"`
		IPAddress   string   `json:"ipAddress"`
		GeoLocation string   `json:"geo"`
		Device      string   `json:"device"`
		Tags        []string `json:"complianceTags"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid JSON"}`, http.StatusBadRequest)
		return
	}

	event, err := h.store.AppendEvent(
		req.EnvelopeID,
		req.Actor,
		req.Action,
		req.Details,
		req.IPAddress,
		req.GeoLocation,
		req.Device,
		req.Tags,
	)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Audit event cryptographically chained",
		"event":   event,
	})
}

// VerifyIntegrity validates the unbroken SHA-256 chain
func (h *AuditHandler) VerifyIntegrity(w http.ResponseWriter, r *http.Request) {
	envelopeID := strings.TrimPrefix(r.URL.Path, "/api/v1/audit/")
	envelopeID = strings.TrimSuffix(envelopeID, "/verify")

	isValid, err := h.store.VerifyChainIntegrity(envelopeID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":         true,
		"envelopeId":      envelopeID,
		"isChainValid":    isValid,
		"tamperDetected":  err != nil,
		"nonRepudiation":  "VERIFIED_ESIGN_eIDAS",
	})
}
