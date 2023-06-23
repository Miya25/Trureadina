package bot

import (
	"Trureadina/bot/handlers"
	"Trureadina/state"
)

func CreateBot() {
	// Add event handlers
	state.Discord.AddHandler(handlers.Ready)          // Ready
	state.Discord.AddHandler(handlers.PresenceUpdate) // Presence Update
	state.Discord.AddHandler(handlers.InteractionCreate) // Interaction Create
	
	// Open Websocket Connection
	state.Discord.Open()
}
