package main

import (
	"context"
	"fmt"
	"github.com/bwmarrin/discordgo"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
 "github.com/infinitybotlist/eureka"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	// Load environment variables from .env file.
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file:", err)
		return
	}

	// Create a PostgreSQL pool connection.
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to PostgreSQL: %v\n", err)
		return
	}
	defer pool.Close()

	// Create a Redis connection
	opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to Redis%v\n", err)
		return
	}
	client := redis.NewClient(opt)

	// Create a new Discord session using the bot token.
	dg, err := discordgo.New("Bot " + os.Getenv("BOT_TOKEN"))
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

 Logger = snippets.CreateZap()

 // Load dovewing state
 baseDovewingState := dovewing.BaseState{
      Pool:           pool,
      Logger:         Logger,
      Context:        Context,
      Redis:          redis,
      OnUpdate:       updateDb,
      UserExpiryTime: 8 * time.Hour,
 }

 DovewingPlatformDiscord, err = dovewing.DiscordStateConfig{
      Session:        Discord,
      PreferredGuild: Config.Servers.Main,
      BaseState: &baseDovewingState,
 }.New()

	// Wait for a termination signal to gracefully close the bot.
	fmt.Println("Bot is now running. Press CTRL-C to exit.")
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt, os.Kill)
	<-sc

	// Clean up and close the Discord session.
	dg.Close()

	// Clean up and close the Database connection
	pool.Close()

	// Clean up and close the Redis connection
	client.Close()
}

func onReady(s *discordgo.Session, event *discordgo.Ready) {
	fmt.Printf("Logged in as %s\n", event.User.String())
}
