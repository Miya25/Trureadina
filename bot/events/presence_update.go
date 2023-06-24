package events

import (
	"fmt"

	"github.com/bwmarrin/discordgo"
)

func PresenceUpdate(s *discordgo.Session, event *discordgo.PresenceUpdate) {
	fmt.Println(event)
} // Broken, prob intents being a bitch.
