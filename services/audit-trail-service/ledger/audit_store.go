package ledger

import (
	"errors"
	"sync"
	"time"

	"github.com/signflow/audit-trail-service/crypto"
)

var (
	ErrTamperDetected = errors.New("audit trail hash chain integrity broken")
)

type AuditEvent struct {
	ID                 string    `json:"id"`
	EnvelopeID         string    `json:"envelopeId"`
	Timestamp          time.Time `json:"timestamp"`
	Actor              string    `json:"actor"`
	Action             string    `json:"action"`
	Details            string    `json:"details"`
	IPAddress          string    `json:"ipAddress"`
	GeoLocation        string    `json:"geo"`
	DeviceFingerprint  string    `json:"device"`
	HashChainPrevious  string    `json:"hashChainPrevious"`
	HashChainCurrent   string    `json:"hashChainCurrent"`
	ComplianceTags     []string  `json:"complianceTags"`
}

type AuditStore struct {
	mu     sync.RWMutex
	chains map[string][]AuditEvent
}

func NewAuditStore() *AuditStore {
	store := &AuditStore{
		chains: make(map[string][]AuditEvent),
	}
	// Seed demo envelope audit log
	now := time.Now()
	prev := crypto.GenesisHash
	curr := crypto.ComputeNextHash(prev, now.Format(time.RFC3339), "Sarah Jenkins", "Envelope Created", "Created initial draft")
	store.chains["env-demo-001"] = []AuditEvent{
		{
			ID:                "aud-001",
			EnvelopeID:        "env-demo-001",
			Timestamp:         now,
			Actor:             "Sarah Jenkins",
			Action:            "Envelope Created",
			Details:           "Created initial draft",
			IPAddress:         "198.51.100.24",
			GeoLocation:       "San Francisco, CA, US",
			DeviceFingerprint: "Chrome 124 / macOS",
			HashChainPrevious: prev,
			HashChainCurrent:  curr,
			ComplianceTags:    []string{"ESIGN", "eIDAS", "SOC2"},
		},
	}
	return store
}

// AppendEvent appends a new verified event to the envelope's hash-chain
func (s *AuditStore) AppendEvent(envelopeID, actor, action, details, ip, geo, device string, tags []string) (AuditEvent, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	chain := s.chains[envelopeID]
	prevHash := crypto.GenesisHash
	if len(chain) > 0 {
		prevHash = chain[len(chain)-1].HashChainCurrent
	}

	now := time.Now().UTC()
	currHash := crypto.ComputeNextHash(prevHash, now.Format(time.RFC3339), actor, action, details)

	event := AuditEvent{
		ID:                "aud-" + time.Now().Format("20060102150405"),
		EnvelopeID:        envelopeID,
		Timestamp:         now,
		Actor:             actor,
		Action:            action,
		Details:           details,
		IPAddress:         ip,
		GeoLocation:       geo,
		DeviceFingerprint: device,
		HashChainPrevious: prevHash,
		HashChainCurrent:  currHash,
		ComplianceTags:    tags,
	}

	s.chains[envelopeID] = append(chain, event)
	return event, nil
}

// GetChain retrieves the full audit log for an envelope
func (s *AuditStore) GetChain(envelopeID string) []AuditEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.chains[envelopeID]
}

// VerifyChainIntegrity validates that all cryptographic links in the chain remain unbroken
func (s *AuditStore) VerifyChainIntegrity(envelopeID string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	chain, exists := s.chains[envelopeID]
	if !exists || len(chain) == 0 {
		return true, nil
	}

	for i, event := range chain {
		expectedPrev := crypto.GenesisHash
		if i > 0 {
			expectedPrev = chain[i-1].HashChainCurrent
		}

		if event.HashChainPrevious != expectedPrev {
			return false, ErrTamperDetected
		}

		recomputed := crypto.ComputeNextHash(
			event.HashChainPrevious,
			event.Timestamp.Format(time.RFC3339),
			event.Actor,
			event.Action,
			event.Details,
		)

		if recomputed != event.HashChainCurrent {
			return false, ErrTamperDetected
		}
	}

	return true, nil
}
