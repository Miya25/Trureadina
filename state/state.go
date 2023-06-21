package state

import (
	"Trureadina/config"
	"context"

	"github.com/bwmarrin/discordgo"
	"github.com/go-playground/validator/v10"
	"github.com/infinitybotlist/eureka/dovewing"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

var (
	Discord                 *discordgo.Session
	Context                 = context.Background()
	Validator               = validator.New()
	Config                  *config.Config
	Postgres                *pgxpool.Pool
	Redis                   *redis.Client
	DovewingPlatformDiscord *dovewing.DiscordState
	Logger                  *zap.SugaredLogger
)
