package state

import (
	"log"
)

func Close() {
	log.Println("Closing connections...")

	if Discord != nil {
		if err := Discord.Close(); err != nil {
			log.Println("Error closing Discord session:", err)
		}
	}

	if Postgres != nil {
		Postgres.Close()
	}

	if Redis != nil {
		if err := Redis.Close(); err != nil {
			log.Println("Error closing Redis client:", err)
		}
	}
}
