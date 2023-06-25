package pkgstate

import (
	"context"

	"github.com/bwmarrin/discordgo"
	"github.com/go-playground/validator/v10"
	"github.com/infinitybotlist/eureka/dovewing"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/go-redis/redis/v8"
	"go.uber.org/zap"
)

type State struct {
	Discord                 *discordgo.Session
	Context                 context.Context
	Validator               *validator.Validate
	Config                  *config.Config
	Postgres                *pgxpool.Pool
	Redis                   *redis.Client
	DovewingPlatformDiscord *dovewing.DiscordState
	Logger                  *zap.SugaredLogger
}

func NewState() *State {
	return &State{
		Context:   context.Background(),
		Validator: validator.New(),
		Logger:    setupLogger(),
	}
}

func setupLogger() *zap.SugaredLogger {
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	return logger.Sugar()
}
