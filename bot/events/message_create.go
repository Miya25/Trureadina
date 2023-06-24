package events

import (
	"fmt"

	"github.com/bwmarrin/discordgo"
)

func MessageCreate(s *discordgo.Session, event *discordgo.MessageCreate) {
	fmt.Printf("%+v\n", event)
} // def a wip, totally.
