package events

import (
	"fmt"

	"github.com/bwmarrin/discordgo"
)

func InteractionCreate(s *discordgo.Session, event *discordgo.InteractionCreate) {
	fmt.Printf("%+v\n", event)
} // def a wip, totally.
