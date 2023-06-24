package deregister

import (
	"Trureadina/state"

	"errors"
	"fmt"
)

func Cmd() error {
	ca, err := state.Discord.Application("@me")

	if err != nil {
		return err
	}

	cmds, err := state.Discord.ApplicationCommands(ca.ID, "")

	if err != nil {
		return err
	}

	for _, v := range cmds {
		err := state.Discord.ApplicationCommandDelete(ca.ID, "", v.ID)
		if err != nil {
			return errors.New("Error unregistering command: " + err.Error())
		} else {
			fmt.Println("=> "+v.Name, "[success]")
		}
	}

	return nil
}
