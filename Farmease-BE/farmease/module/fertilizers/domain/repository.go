package domain

import "context"

type UseCase interface {
	GetFertilizerRecommendation(ctx context.Context) (*HasilRekomendasiLengkap, error)
}
