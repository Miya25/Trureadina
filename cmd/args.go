package cmd

import (
	"Trureadina/cmd/deploycmd"
	"fmt"
	"os"

	"github.com/fatih/color"
)

var bold = color.New(color.Bold).SprintFunc()

type Command struct {
	Name        string
	Description string
	Run         func() error
}

var Commands []Command

func init() {
	// We use a init function here to avoid circular imports
	Commands = []Command{
		{
			Name:        "deploycmds",
			Description: "Deploy app commands",
			Run:         deploycmd.Cmd,
		},
		{
			Name:        "help",
			Description: "Show this help message",
			Run:         HelpCommand,
		},
	}
}

// Shorthand for “Commands = append(Commands, cmd)“
func AddCommand(cmd Command) {
	Commands = append(Commands, cmd)
}

// Help command
func HelpCommand() error {
	fmt.Println("Available commands")
	fmt.Println()

	for _, c := range Commands {
		fmt.Printf("%s - %s\n", c.Name, c.Description)
	}

	return nil
}

func RunCommand() {
	arg := os.Args[1]

	var found bool

	for _, c := range Commands {
		if c.Name == arg {
			found = true
			err := c.Run()

			if err != nil {
				fmt.Println(bold("Error:", err))
			}

			break
		}
	}

	if !found {
		fmt.Println("Unknown argument: " + arg)
		fmt.Println()
		HelpCommand()
	}
}
