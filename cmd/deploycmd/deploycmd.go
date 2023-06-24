package deploycmd

import (
	"errors"
	"fmt"

	"Trureadina/bot/handler"
	"Trureadina/state"

	"github.com/bwmarrin/discordgo"
)

func Cmd() error {
	ca, err := state.Discord.Application("@me")

	if err != nil {
		return err
	}

	for _, cmd := range handler.Commands {
		// Create the ApplicationCommand struct from the parsed command data.
		applicationCommand := discordgo.ApplicationCommand{
			Name:        cmd.Name,
			Description: cmd.Description,
			Options:     make([]*discordgo.ApplicationCommandOption, len(cmd.Options)),
		}

		// Convert each Option from the parsed command data.
		for i, option := range cmd.Options {
			choices := make([]*discordgo.ApplicationCommandOptionChoice, len(option.Choices))
			for j, choice := range option.Choices {
				choices[j] = &discordgo.ApplicationCommandOptionChoice{
					Name:  choice.Name,
					Value: choice.Value,
				}
			}

			applicationCommand.Options[i] = &discordgo.ApplicationCommandOption{
				Name:        option.Name,
				Description: option.Description,
				Type:        option.Type,
				Required:    option.Required,
				Choices:     choices,
			}
		}

		// Register the command with Discord.
		_, err := state.Discord.ApplicationCommandCreate(ca.ID, "", &applicationCommand)
		if err != nil {
			return errors.New("Error registering command: " + err.Error())
		} else {
			fmt.Println("=> "+cmd.Name, "[success]")
		}
	}

	return nil
}
