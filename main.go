package main

import (
	"Trureadina/bot"
	"Trureadina/bot/cmds"
	"Trureadina/cmd"
	"Trureadina/state"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	state.Setup()

	cmds.Register()

	if len(os.Args) > 1 {
		cmd.RunCommand()
		return
	}

	if err := bot.CreateBot(); err != nil {
		state.Logger.Errorln("Failed to create bot:", err)
		return
	}

	exitSignal := make(chan os.Signal, 1)
	signal.Notify(exitSignal, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	s := <-exitSignal

	state.Logger.Errorln("Received", s, "signal. Closing...")
	state.Close()
	state.Logger.Info("Closed open state connections. Exiting...")
}
