package main

import (
	"Trureadina/bot"
	"Trureadina/cmd"
	"Trureadina/state"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	state.Setup()

	if len(os.Args) > 1 {
		cmd.RunCommand()
		return
	}

	bot.CreateBot()

	done := make(chan struct{})

	go func() {
		sc := make(chan os.Signal, 1)
		signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
		s := <-sc

		state.Logger.Errorln("Recieved", s, "signal. Closing...")
		state.Close()
		state.Logger.Info("Closed open state connections. Exiting...")

		close(done)
	}()

	<-done
	state.Logger.Info("Recieved done channel close. Exiting...")
}
