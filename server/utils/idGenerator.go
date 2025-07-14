package utils

import (
	"crypto/rand"
	"math/big"
)

var symbols = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func Random(size int) []byte {
	random := make([]byte, size)
	symbolsLen := big.NewInt(int64(len(symbols)))

	for i := range random {
		currIndex, err := rand.Int(rand.Reader, symbolsLen)
		if err != nil {
			return nil
		}

		random[i] = symbols[currIndex.Int64()]
	}

	return random
}
