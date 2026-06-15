package main

import (
	"fmt"
	"log"

	"github.com/farmease/farmease-be/farmease/cmd"
)

func main() {
	fmt.Println("======================================")
	fmt.Println("SERVER IS STARTING: main() execution")
	fmt.Println("======================================")
	if err := cmd.Execute(); err != nil {
		fmt.Println("SERVER FATAL ERROR:", err)
		log.Fatal(err)
	}
	fmt.Println("SERVER STOPPED NORMALLY")
}
