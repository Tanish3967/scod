package main

import (
	"log"
	"os"

	"github.com/resend/resend-go/v4"
)

func main() {
	// Replace "re_xxxxxxxxx" with your real Resend API Key, or set the RESEND_API_KEY environment variable.
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		apiKey = "re_xxxxxxxxx"
	}

	if apiKey == "re_xxxxxxxxx" {
		log.Println("[WARNING] You are using the placeholder API key 're_xxxxxxxxx'. Please replace it with your actual Resend API key.")
	}

	client := resend.NewClient(apiKey)

	params := &resend.SendEmailRequest{
		From:    "onboarding@resend.dev",
		To:      []string{"tanish3967@gmail.com"},
		Subject: "Hello World - SignFlow Secure Agreement",
		Html:    "<p>Congrats on sending your <strong>first email</strong> via SignFlow and Resend!</p>",
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.Fatalf("failed to send email: %v", err)
	}

	log.Printf("email sent successfully with ID: %s", sent.Id)
}
