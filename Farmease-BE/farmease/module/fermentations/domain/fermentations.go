package domain

import (
	"context"
	"time"
)

type SilageFermentationLog struct {
	IDLog             string     `json:"id_log"`
	IDConversion      string     `json:"id_conversion"`
	CheckDate         time.Time  `json:"check_date"`
	Status            string     `json:"status"` // 'fermentasi', 'siap', 'gagal'
	PHLevel           *float64   `json:"ph_level"`
	Temperature       *float64   `json:"temperature"`
	PhysicalCondition *string    `json:"physical_condition"`
	Notes             *string    `json:"notes"`
	CreatedAt         time.Time  `json:"created_at"`
}

type FermentationRepository interface {
	StoreLog(ctx context.Context, log *SilageFermentationLog) error
	FindLogsByConversionID(ctx context.Context, conversionID string) ([]*SilageFermentationLog, error)
	FindLatestLogByConversionID(ctx context.Context, conversionID string) (*SilageFermentationLog, error)
	GetConversionTarget(ctx context.Context, conversionID string) (string, float64, error)
}

type UseCase interface {
	CreateLog(ctx context.Context, log *SilageFermentationLog) error
	GetLogs(ctx context.Context, conversionID string) ([]*SilageFermentationLog, error)
}
