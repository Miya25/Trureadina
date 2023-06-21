package bot

import (
	"Trureadina/state"
	"fmt"

	"github.com/bwmarrin/discordgo"
)

func CreateBot() {
	// Add a handler for the "ready" event.
	state.Discord.AddHandler(func(s *discordgo.Session, event *discordgo.Ready) {
		fmt.Printf("Logged in as %s\n", event.User.String())
	})

	// Set the presence/status of bot profile
	state.Discord.UpdateWatchStatus(0, "for updates.")
}
