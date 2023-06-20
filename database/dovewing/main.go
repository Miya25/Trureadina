package dovewing

import (
	"fmt"
	"os"
	"context"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/infinitybotlist/eureka/dovewing"
	"github.com/infinitybotlist/eureka/snippets"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

var DovewingPlatformDiscord *dovewing.DiscordState

func main(dg * discordgo.Session, redisClient * redis.Client, pool * pgxpool.Pool) {
	// Initalize Dovewing
	var Logger = snippets.CreateZap()

	updateDb := func(u *dovewing.PlatformUser) error {
		fmt.Println("updateCache", u)
		return nil
	}

	baseDovewingState := dovewing.BaseState{
		Pool:           pool,
		Logger:         Logger,
		Context:        context.Background(),
		Redis:          redisClient,
		OnUpdate:       updateDb,
		UserExpiryTime: 8 * time.Hour,
	}

	DovewingPlatformDiscord, err = dovewing.DiscordStateConfig{
		Session:        dg,
		PreferredGuild: os.Getenv("MAIN_SERVER"),
		BaseState:      &baseDovewingState,
	}.New()

	if err != nil {
		fmt.Println("Error creating Dovewing state:", err)
		return
	}
}