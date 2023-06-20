package database

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"os"
)

func main() {
	// Load environment variables from .env file.
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file:", err)
		return
	}

	// Initalize PostgreSQL, Redis
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to PostgreSQL: %v\n", err)
		return
	}
	defer pool.Close()

	opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to Redis: %v\n", err)
		return
	}
	client := redis.NewClient(opt)
}