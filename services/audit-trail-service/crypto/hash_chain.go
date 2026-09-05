package crypto

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

const GenesisHash = "0000000000000000000000000000000000000000000000000000000000000000"

// ComputeNextHash creates a tamper-evident SHA-256 link in the audit chain
func ComputeNextHash(prevHash, timestamp, actor, action, details string) string {
	payload := fmt.Sprintf("%s|%s|%s|%s|%s", prevHash, timestamp, actor, action, details)
	hash := sha256.Sum256([]byte(payload))
	return hex.EncodeToString(hash[:])
}

// ComputeDocumentChecksum hashes raw document bytes
func ComputeDocumentChecksum(data []byte) string {
	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:])
}
