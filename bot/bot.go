package bot

import (
	"Trureadina/state"
	"Trureadina/bot/handlers"
)

func CreateBot() {
	// Add a handler for the "ready" event.
	state.Discord.AddHandler(handlers.Ready)
}
