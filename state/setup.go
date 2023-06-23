package state

import (
	"Trureadina/config"
	"context"
	"errors"
	"os"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/infinitybotlist/eureka/dovewing"
	"github.com/infinitybotlist/eureka/genconfig"
	"github.com/infinitybotlist/eureka/snippets"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gopkg.in/yaml.v3"
)

func Setup() {
	// Initialize Dovewing logger
	Logger = snippets.CreateZap()

	Logger.Info("Generating config")
	genconfig.GenConfig(config.Config{})

	Logger.Info("Loading config: config.yaml")
	cfg, err := os.ReadFile("config.yaml")

	if err != nil {
		Logger.Fatalln("Failed to read config:", err.Error())
	}

	err = yaml.Unmarshal(cfg, &Config)

	if err != nil {
		Logger.Fatalln("Failed to unmarshal config:", err.Error())
	}

	Logger.Info("Validating config")
	err = Validator.Struct(Config)

	if err != nil {
		Logger.Fatalln("Config validation failed:", err.Error())
	}

	Logger.Info("Connecting to service [discord]")
	Discord, err = createDiscordSession()

	if err != nil {
		Logger.Fatalln("Error creating Discord session:", err)
	}

	Logger.Info("Connecting to service [postgres]")
	Postgres, err = createPostgresPool()

	if err != nil {
		Logger.Fatalln("Error creating PostgreSQL pool:", err)
	}

	Logger.Info("Connecting to service [redis]")
	Redis, err = createRedisClient()

	if err != nil {
		Logger.Fatalln("Error creating Redis client:", err)
	}

	// Setup Dovewing
	Logger.Info("=> Setting up Dovewing")
	err = setupDovewing()

	if err != nil {
		Logger.Fatalln("Error setting up Dovewing:", err)
	}
}

func createDiscordSession() (*discordgo.Session, error) {
	// Create a new Discord session using the bot token.
	dg, err := discordgo.New("Bot " + Config.DiscordToken)
	if err != nil {
		return nil, err
	}

	// Open a websocket connection to Discord.
	err = dg.Open()
	if err != nil {
		return nil, errors.New("error opening connection: " + err.Error())
	}

	return dg, nil
}

func createPostgresPool() (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(Context, Config.PostgresURL)
	if err != nil {
		return nil, errors.New("unable to connect to PostgreSQL: " + err.Error())
	}

	return pool, nil
}

func createRedisClient() (*redis.Client, error) {
	opt, err := redis.ParseURL(Config.RedisURL)
	if err != nil {
		return nil, errors.New("unable to connect to Redis: " + err.Error())
	}
	client := redis.NewClient(opt)

	return client, nil
}

func setupDovewing() error {
	// Callback function to update the database when a user's data chang might work
	onUpdate := func(u *dovewing.PlatformUser) error {
		return nil
	}

	// Base state for dove wing
	baseState := dovewing.BaseState{
		Pool:           Postgres,
		Logger:         Logger,
		Context:        context.Background(),
		Redis:          Redis,
		OnUpdate:       onUpdate,
		UserExpiryTime: 8 * time.Hour,
	}

	Logger.Info("Dovewing: platform->discord")

	// Discord-specific state config for Dovewing
	var err error
	DovewingPlatformDiscord, err = dovewing.DiscordStateConfig{
		Session:        Discord,
		PreferredGuild: Config.MainServer,
		BaseState:      &baseState,
	}.New()

	if err != nil {
		Logger.Error("Failed to create Dovewing state", zap.Error(err))
		return err
	}

	return nil
}
