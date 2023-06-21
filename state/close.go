package state

func Close() {
	Logger.Info("Closing connections...")

	err := Discord.Close()

	if err != nil {
		Logger.Error("Error closing Discord session:", err)
	}

	Postgres.Close()

	err = Redis.Close()

	if err != nil {
		Logger.Error("Error closing Redis client:", err)
	}
}
