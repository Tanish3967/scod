package models

import "time"

type EnvelopeStatus string

const (
	StatusDraft     EnvelopeStatus = "draft"
	StatusSent      EnvelopeStatus = "sent"
	StatusDelivered EnvelopeStatus = "delivered"
	StatusViewed    EnvelopeStatus = "viewed"
	StatusSigned    EnvelopeStatus = "signed"
	StatusCompleted EnvelopeStatus = "completed"
	StatusDeclined  EnvelopeStatus = "declined"
	StatusVoided    EnvelopeStatus = "voided"
	StatusExpired   EnvelopeStatus = "expired"
)

type RecipientRole string

const (
	RoleSigner            RecipientRole = "signer"
	RoleApprover          RecipientRole = "approver"
	RoleCC                RecipientRole = "cc"
	RoleInPerson          RecipientRole = "in_person"
	RoleCertifiedDelivery RecipientRole = "certified_delivery"
	RoleEditor            RecipientRole = "editor"
)

type AuthType string

const (
	AuthEmail        AuthType = "email"
	AuthAccessCode   AuthType = "access_code"
	AuthSMSOTP       AuthType = "sms_otp"
	AuthKBA          AuthType = "kba"
	AuthIDVBiometric AuthType = "idv_biometric"
)

type FieldType string

const (
	FieldSignature  FieldType = "signature"
	FieldInitial    FieldType = "initial"
	FieldDateSigned FieldType = "date_signed"
	FieldName       FieldType = "name"
	FieldEmail      FieldType = "email"
	FieldText       FieldType = "text"
	FieldCheckbox   FieldType = "checkbox"
	FieldRadio      FieldType = "radio"
	FieldDropdown   FieldType = "dropdown"
	FieldAttachment FieldType = "attachment"
	FieldPayment    FieldType = "payment"
	FieldFormula    FieldType = "formula"
	FieldStamp      FieldType = "stamp"
)

type DocumentField struct {
	ID                string    `json:"id"`
	Type              FieldType `json:"type"`
	Label             string    `json:"label"`
	RecipientID       string    `json:"recipientId"`
	Page              int       `json:"page"`
	X                 float64   `json:"x"`
	Y                 float64   `json:"y"`
	Width             float64   `json:"width"`
	Height            float64   `json:"height"`
	Required          bool      `json:"required"`
	Value             string    `json:"value,omitempty"`
	Options           []string  `json:"options,omitempty"`
	PaymentAmount     float64   `json:"paymentAmount,omitempty"`
	Currency          string    `json:"currency,omitempty"`
	FormulaExpression string    `json:"formulaExpression,omitempty"`
	AISuggested       bool      `json:"aiSuggested,omitempty"`
	AIConfidence      float64   `json:"aiConfidence,omitempty"`
}

type Recipient struct {
	ID             string        `json:"id"`
	Name           string        `json:"name"`
	Email          string        `json:"email"`
	Role           RecipientRole `json:"role"`
	RoutingOrder   int           `json:"routingOrder"`
	AuthType       AuthType      `json:"authType"`
	AccessCode     string        `json:"accessCode,omitempty"`
	PhoneNumber    string        `json:"phoneNumber,omitempty"`
	Status         string        `json:"status"` // waiting, ready, viewed, signed, declined
	SignedAt       *time.Time    `json:"signedAt,omitempty"`
	SignatureData  *SignatureData `json:"signatureData,omitempty"`
}

type SignatureData struct {
	Type              string `json:"type"` // draw, type, upload
	Value             string `json:"value"`
	FontFamily        string `json:"fontFamily,omitempty"`
	AppliedAt         string `json:"appliedAt"`
	IPAddress         string `json:"ipAddress"`
	DeviceFingerprint string `json:"deviceFingerprint"`
}

type DocumentPage struct {
	PageNumber int    `json:"pageNumber"`
	Title      string `json:"title"`
	Content    string `json:"content"`
}

type AgreementDocument struct {
	ID         string         `json:"id"`
	Name       string         `json:"name"`
	Size       string         `json:"size"`
	FileType   string         `json:"fileType"`
	SHA256Hash string         `json:"sha256Hash"`
	Pages      []DocumentPage `json:"pages"`
}

type EnvelopeSender struct {
	Name         string `json:"name"`
	Email        string `json:"email"`
	Organization string `json:"organization"`
	AvatarURL    string `json:"avatarUrl,omitempty"`
}

type Envelope struct {
	ID                 string              `json:"id"`
	Title              string              `json:"title"`
	Description        string              `json:"description,omitempty"`
	Sender             EnvelopeSender      `json:"sender"`
	Status             EnvelopeStatus      `json:"status"`
	CreatedAt          time.Time           `json:"createdAt"`
	UpdatedAt          time.Time           `json:"updatedAt"`
	ExpiresAt          time.Time           `json:"expiresAt"`
	CompletedAt        *time.Time          `json:"completedAt,omitempty"`
	Documents          []AgreementDocument `json:"documents"`
	Fields             []DocumentField     `json:"fields"`
	Recipients         []Recipient         `json:"recipients"`
	Tags               []string            `json:"tags"`
	RequiresNotary     bool                `json:"requiresNotary,omitempty"`
	NotarySessionID    string              `json:"notarySessionId,omitempty"`
	RequiresPayment    bool                `json:"requiresPayment,omitempty"`
	TotalPaymentAmount float64             `json:"totalPaymentAmount,omitempty"`
}
