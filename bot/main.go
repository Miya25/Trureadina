package bot

import (
	"fmt"
	"github.com/bwmarrin/discordgo"
	"github.com/joho/godotenv"
	"os"
	"database/dovewing"
)

var dg *discordgo.Session

func bot() {
	// Load environment variables from .env file.
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file:", err)
		return
	}

	// Create a new Discord session using the bot token.
	dg, err = discordgo.New("Bot " + os.Getenv("BOT_TOKEN"))
	if err != nil {
		fmt.Println("Error creating Discord session:", err)
		return
	}

	// Add a handler for the "ready" event.
	dg.AddHandler(onReady)

	// Open a websocket connection to Discord.
	err = dg.Open()
	if err != nil {
		fmt.Println("Error opening connection:", err)
		return
	}

	// Set the presence/status of bot profile
	dg.UpdateWatchStatus(0, "for updates.")

	// Initalize Dovewing
	ppt := dovewing.main(dg, client, pool)
}

func onReady(s *discordgo.Session, event *discordgo.Ready) {
	fmt.Printf("Logged in as %s\n", event.User.String())
}
