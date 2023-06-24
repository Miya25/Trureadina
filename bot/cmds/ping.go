package cmds

import "Trureadina/bot/handler"

func init() {
	handler.Commands.Register(handler.Command{
		Name:        "ping",
		Description: "Check my ping!",
	})
}
