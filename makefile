all:
	CGO_ENABLED=0 go build -v
	go fmt