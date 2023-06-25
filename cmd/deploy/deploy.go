package deploy

import (
	"fmt"
	"github.com/pkg/errors"
	"Trureadina/bot/handler"
	"Trureadina/state"
	"github.com/bwmarrin/discordgo"
)

func Cmd() error {
	ca, err := state.Discord.Application("@me")
	if err != nil {
		return errors.Wrap(err, "Failed to retrieve application information")
	}

	for _, cmd := range handler.Commands {
		applicationCommand := discordgo.ApplicationCommand{
			Name:        cmd.Name,
			Description: cmd.Description,
			Options:     make([]*discordgo.ApplicationCommandOption, len(cmd.Options)),
		}

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

		_, err := state.Discord.ApplicationCommandCreate(ca.ID, "", &applicationCommand)
		if err != nil {
			return errors.Wrapf(err, "Failed to register command '%s'", cmd.Name)
		}

		state.Logger.Infof("Registered command '%s'", cmd.Name)
	}

	return nil
}
