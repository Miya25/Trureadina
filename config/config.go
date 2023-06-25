package config

type Config struct {
	Port         string `yaml:"port" comment:"The port to run the web server on"`
	PostgresURL  string `yaml:"postgres_url" validate:"required" comment:"The URL of the PostgreSQL database"`
	RedisURL     string `yaml:"redis_url" validate:"required" comment:"The URL of the Redis server"`
	DiscordToken string `yaml:"discord_token" validate:"required" comment:"The Discord bot token"`
	MainServer   string `yaml:"main_server" validate:"required" comment:"The ID of the main server"`
}
