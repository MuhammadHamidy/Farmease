package main

import (
	"fmt"
	"os"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	passwords := []string{"admin123", "pemilik123", "kebun123", "kandang123"}
	file, err := os.Create("generated_hashes.txt")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	for _, p := range passwords {
		hash, _ := bcrypt.GenerateFromPassword([]byte(p), 10)
		fmt.Fprintf(file, "%s: %s\n", p, string(hash))
	}
}
