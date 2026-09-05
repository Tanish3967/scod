package statemachine

import (
	"errors"
	"fmt"
	"github.com/signflow/envelope-service/models"
)

var (
	ErrInvalidTransition = errors.New("invalid state transition")
	ErrCannotSignCompleted = errors.New("cannot sign already completed envelope")
	ErrCannotModifyVoided  = errors.New("cannot modify voided envelope")
)

// ValidTransitions maps allowed state progressions
var validTransitions = map[models.EnvelopeStatus][]models.EnvelopeStatus{
	models.StatusDraft: {
		models.StatusSent,
		models.StatusVoided,
	},
	models.StatusSent: {
		models.StatusDelivered,
		models.StatusViewed,
		models.StatusSigned,
		models.StatusCompleted,
		models.StatusDeclined,
		models.StatusVoided,
		models.StatusExpired,
	},
	models.StatusDelivered: {
		models.StatusViewed,
		models.StatusSigned,
		models.StatusCompleted,
		models.StatusDeclined,
		models.StatusVoided,
	},
	models.StatusViewed: {
		models.StatusSigned,
		models.StatusCompleted,
		models.StatusDeclined,
		models.StatusVoided,
	},
	models.StatusSigned: {
		models.StatusCompleted,
		models.StatusDeclined,
		models.StatusVoided,
	},
	models.StatusCompleted: {}, // Terminal
	models.StatusDeclined:  {}, // Terminal
	models.StatusVoided:    {}, // Terminal
	models.StatusExpired:   {}, // Terminal
}

// CanTransition checks if moving from currentState to nextState is valid
func CanTransition(from models.EnvelopeStatus, to models.EnvelopeStatus) bool {
	allowed, exists := validTransitions[from]
	if !exists {
		return false
	}
	for _, s := range allowed {
		if s == to {
			return true
		}
	}
	return false
}

// ValidateTransition verifies and transitions an envelope state
func ValidateTransition(env *models.Envelope, target models.EnvelopeStatus) error {
	if env.Status == target {
		return nil
	}

	if !CanTransition(env.Status, target) {
		return fmt.Errorf("%w: cannot transition envelope %s from %s to %s",
			ErrInvalidTransition, env.ID, env.Status, target)
	}

	return nil
}
