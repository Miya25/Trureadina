package bot

import (
	"Trureadina/bot/events"
	"Trureadina/state"

	"github.com/bwmarrin/discordgo"
)

func CreateBot() {
	// Add event handlers
	state.Discord.AddHandler(events.Ready)             // Ready
	state.Discord.AddHandler(events.PresenceUpdate)    // Presence Update
	state.Discord.AddHandler(events.InteractionCreate) // Interaction Create
	state.Discord.AddHandler(events.MessageCreate)     // Message Create

	// Intents
	state.Discord.Identify.Intents = discordgo.IntentsGuilds | discordgo.IntentsGuildPresences | discordgo.IntentsGuildMembers | discordgo.IntentsMessageContent | discordgo.IntentsGuildMessages

	// Open Websocket Connection
	state.Discord.Open()
}
