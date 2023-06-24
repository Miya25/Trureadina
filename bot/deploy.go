package bot

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/bwmarrin/discordgo"
)

// STILL A WIP
type CommandData struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Options     []Option `json:"options"`
}

type Option struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Type        int      `json:"type"`
	Required    bool     `json:"required"`
	Choices     []Choice `json:"choices,omitempty"`
}

type Choice struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

func registerInteractionCommands(s *discordgo.Session) {
	// Get the list of files in the "commands" directory.
	files, err := os.ReadDir("commands")
	if err != nil {
		fmt.Println("Error reading command files:", err)
		return
	}

	// Iterate through each file and register the command.
	for _, file := range files {
		if file.IsDir() {
			continue // Skip directories.
		}

		// Read the command data from the file.
		filePath := filepath.Join("commands", file.Name())
		data, err := os.ReadFile(filePath)
		if err != nil {
			fmt.Println("Error reading command file:", err)
			continue
		}

		// Parse the JSON data into a CommandData struct.
		var commandData CommandData
		err = json.Unmarshal(data, &commandData)
		if err != nil {
			fmt.Println("Error parsing command file:", err)
			continue
		}

		// Register the command using the parsed data.
		registerCommand(s, commandData)
	}
}

func registerCommand(s *discordgo.Session, commandData CommandData) {
	// Create the ApplicationCommand struct from the parsed command data.
	applicationCommand := discordgo.ApplicationCommand{
		Name:        commandData.Name,
		Description: commandData.Description,
		Options:     make([]*discordgo.ApplicationCommandOption, len(commandData.Options)),
	}

	// Convert each Option from the parsed command data.
	for i, option := range commandData.Options {
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
			Type:        discordgo.ApplicationCommandOptionType(option.Type),
			Required:    option.Required,
			Choices:     choices,
		}
	}

	// Register the command with Discord.
	_, err := s.ApplicationCommandCreate(s.State.User.ID, "", &applicationCommand)
	if err != nil {
		fmt.Println("Error registering command:", err)
	} else {
		fmt.Println("Command registered successfully:", commandData.Name)
	}
}