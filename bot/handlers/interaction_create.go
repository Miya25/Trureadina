package handlers

import (
	"fmt"

	"github.com/bwmarrin/discordgo"
)

func InteractionCreate(s *discordgo.Session, event *discordgo.InteractionCreate) {
	fmt.Println(event)
} // def a wip, totally.