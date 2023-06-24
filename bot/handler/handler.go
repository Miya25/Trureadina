package handler

import (
	"github.com/bwmarrin/discordgo"
)

// STILL A WIP
type Command struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Options     []Option `json:"options"`
}

type Option struct {
	Name        string                                 `json:"name"`
	Description string                                 `json:"description"`
	Type        discordgo.ApplicationCommandOptionType `json:"type"`
	Required    bool                                   `json:"required"`
	Choices     []Choice                               `json:"choices,omitempty"`
}

type Choice struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type CommandList []Command

func (c *CommandList) AddCommand(cmd Command) {
	*c = append(*c, cmd)
}

// The list of commands in the handler
var Commands CommandList
