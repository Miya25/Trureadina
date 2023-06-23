package handlers

import (
	"Trureadina/state"
	"github.com/bwmarrin/discordgo"
)

func Ready(s *discordgo.Session, event *discordgo.Ready) {
	// Tell the console that we officially logged into Discord.
	state.Logger.Info("Logged in as " + event.User.String())

	// Set the presence/status of bot profile
	state.Discord.UpdateWatchStatus(0, "Select List")
}
