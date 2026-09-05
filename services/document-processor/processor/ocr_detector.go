package processor

import (
	"crypto/sha256"
	"encoding/hex"
	"strings"
)

type DetectedField struct {
	Type       string  `json:"type"` // signature, initial, date_signed, name, stamp
	Label      string  `json:"label"`
	Page       int     `json:"page"`
	X          float64 `json:"x"`
	Y          float64 `json:"y"`
	Width      float64 `json:"width"`
	Height     float64 `json:"height"`
	Confidence float64 `json:"confidence"`
}

// ComputeSHA256 returns hex digest of data bytes
func ComputeSHA256(data []byte) string {
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:])
}

// AutoDetectFields scans document text content for signature anchors and blanks
func AutoDetectFields(docText string, totalPages int) []DetectedField {
	var fields []DetectedField
	lower := strings.ToLower(docText)

	if strings.Contains(lower, "signature") || strings.Contains(lower, "in witness whereof") || strings.Contains(lower, "executed by") {
		fields = append(fields, DetectedField{
			Type:       "signature",
			Label:      "Client Authorized Signature",
			Page:       totalPages,
			X:          10.0,
			Y:          72.0,
			Width:      38.0,
			Height:     10.0,
			Confidence: 0.98,
		})
	}

	if strings.Contains(lower, "date") || strings.Contains(lower, "effective as of") {
		fields = append(fields, DetectedField{
			Type:       "date_signed",
			Label:      "Date Signed",
			Page:       totalPages,
			X:          55.0,
			Y:          72.0,
			Width:      35.0,
			Height:     8.0,
			Confidence: 0.95,
		})
	}

	if strings.Contains(lower, "name:") || strings.Contains(lower, "by:") || strings.Contains(lower, "title:") {
		fields = append(fields,
			DetectedField{
				Type:       "name",
				Label:      "Signer Full Name",
				Page:       totalPages,
				X:          10.0,
				Y:          84.0,
				Width:      38.0,
				Height:     7.0,
				Confidence: 0.92,
			},
			DetectedField{
				Type:       "text",
				Label:      "Title / Designation",
				Page:       totalPages,
				X:          55.0,
				Y:          84.0,
				Width:      35.0,
				Height:     7.0,
				Confidence: 0.89,
			},
		)
	}

	if strings.Contains(lower, "notary") || strings.Contains(lower, "acknowledgment") || strings.Contains(lower, "jurat") {
		fields = append(fields, DetectedField{
			Type:       "stamp",
			Label:      "Notary Public Digital Seal",
			Page:       totalPages,
			X:          55.0,
			Y:          55.0,
			Width:      35.0,
			Height:     18.0,
			Confidence: 0.96,
		})
	}

	return fields
}
