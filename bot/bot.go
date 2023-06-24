package bot

import (
	"Trureadina/bot/events"
	"Trureadina/state"
)

func CreateBot() {
	// Add event handlers
	state.Discord.AddHandler(events.Ready)             // Ready
	state.Discord.AddHandler(events.PresenceUpdate)    // Presence Update
	state.Discord.AddHandler(events.InteractionCreate) // Interaction Create

	// Open Websocket Connection
	state.Discord.Open()
}
