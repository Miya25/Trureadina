package main

import (
    "fmt"
    "os"
    "os/signal"
    "syscall"

    "github.com/bwmarrin/discordgo"
    "github.com/joho/godotenv"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)


func main() {
    // Load environment variables from .env file.
    err := godotenv.Load()
    if err != nil {
        fmt.Println("Error loading .env file:", err)
        return
    }

    // Get the bot token from environment variables.
    botToken := os.Getenv("BOT_TOKEN")

    // Establish a database connection
    dsn := "host=localhost user=your_username password=your_password dbname=your_database port=5432 sslmode=disable"
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        panic("Failed to connect to the database!")
    }

    // Create a new Discord session using the bot token.
    dg, err := discordgo.New("Bot " + botToken)
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

    // Wait for a termination signal to gracefully close the bot.
    fmt.Println("Bot is now running. Press CTRL-C to exit.")
    sc := make(chan os.Signal, 1)
    signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt, os.Kill)
    <-sc

    // Clean up and close the Discord session.
    dg.Close()

    // Close the database connection
    db.Close()
}

func onReady(s *discordgo.Session, event *discordgo.Ready) {
    fmt.Printf("Logged in as %s\n", event.User.String())
}
