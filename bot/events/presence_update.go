package events

import (
	"fmt"

	"github.com/bwmarrin/discordgo"
)

func PresenceUpdate(s *discordgo.Session, event *discordgo.PresenceUpdate) {
	fmt.Printf("%+v\n", event)
} // def a wip, totally.
