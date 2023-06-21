package config

type Config struct {
	Port         string `yaml:"port" validate:"required" comment:"Port to run the webserver on"`
	PostgresURL  string `yaml:"postgres_url" validate:"required" comment:"PostgreSQL URL"`
	RedisURL     string `yaml:"redis_url" validate:"required" comment:"Redis URL"`
	DiscordToken string `yaml:"discord_token" validate:"required" comment:"Discord Bot Token"`
	MainServer   string `yaml:"main_server" validate:"required" comment:"Main server ID"`
}
