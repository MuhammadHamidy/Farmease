package domain

import (
	"context"
	"time"
)

type Feed struct {
	IDFeed           string    `json:"id_feed" db:"id_feed"`
	FeedName         string    `json:"feed_name" db:"feed_name"`
	Unit             string    `json:"unit" db:"unit"`
	AvailableStock   float64   `json:"available_stock" db:"available_stock"`
	PricePerUnit     float64   `json:"price_per_unit" db:"price_per_unit"`
	Category         string    `json:"category" db:"category"`
	ExternalSourceID *string   `json:"external_source_id,omitempty" db:"external_source_id"`
	SourceType       string    `json:"source_type" db:"source_type"`
	SourceAPIURL     *string   `json:"source_api_url,omitempty" db:"source_api_url"`
	Notes            string    `json:"notes" db:"notes"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

type Feeding struct {
	IDFeeding   string    `json:"id_feeding" db:"id_feeding"`
	IDSheep     string    `json:"id_sheep" db:"id_sheep"`
	IDFeed      string    `json:"id_feed" db:"id_feed"`
	FeedingDate time.Time `json:"feeding_date" db:"feeding_date"`
	Amount      float64   `json:"amount" db:"amount"`
	Unit        string    `json:"unit" db:"unit"`
	Notes       string    `json:"notes" db:"notes"`
	FeedName    string    `json:"feed_name,omitempty" db:"feed_name"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type FeedRecommendation struct {
	IDSheep            string               `json:"id_sheep"`
	SheepName          string               `json:"sheep_name"`
	WeightKg           float64              `json:"weight_kg"`
	Status             string               `json:"status"`
	RekomendasiHarian  []RecommendationItem `json:"rekomendasi_harian"`
	TotalPakanHarianKg float64              `json:"total_pakan_harian_kg"`
}

type CageFeedRecommendation struct {
	IDCage            string  `json:"id_kandang"`
	JumlahDomba       int     `json:"jumlah_domba"`
	TotalHijauanKg    float64 `json:"total_hijauan_kg"`
	TotalKonsentratKg float64 `json:"total_konsentrat_kg"`
}

type RecommendationItem struct {
	Kategori    string  `json:"kategori"`
	JumlahKg    float64 `json:"jumlah_kg"`
	Keterangan string  `json:"keterangan"`
}

type FeedingFilter struct {
	IDSheep string
	Page    int
	PerPage int
}

type FeedingMixture struct {
	IDFeedingMixture string                 `json:"id_feeding_mixture" db:"id_feeding_mixture"`
	IDSheep          string                 `json:"id_sheep" db:"id_sheep"`
	FeedingDate      time.Time              `json:"feeding_date" db:"feeding_date"`
	TotalAmount      float64                `json:"total_amount" db:"total_amount"`
	Unit             string                 `json:"unit" db:"unit"`
	Notes            string                 `json:"notes" db:"notes"`
	CreatedAt        time.Time              `json:"created_at" db:"created_at"`
	Details          []FeedingMixtureDetail `json:"details"`
}

type FeedingMixtureDetail struct {
	IDDetail         string  `json:"id_detail" db:"id_detail"`
	IDFeedingMixture string  `json:"id_feeding_mixture" db:"id_feeding_mixture"`
	IDFeed           string  `json:"id_feed" db:"id_feed"`
	Amount           float64 `json:"amount" db:"amount"`
	FeedName         string  `json:"feed_name,omitempty"`
}

type SilageConversion struct {
	IDConversion   string                   `json:"id_conversion" db:"id_conversion"`
	IDTargetFeed   string                   `json:"id_target_feed" db:"id_target_feed"`
	ConversionDate time.Time                `json:"conversion_date" db:"conversion_date"`
	TargetAmount   float64                  `json:"target_amount" db:"target_amount"`
	Unit           string                   `json:"unit" db:"unit"`
	Notes          string                   `json:"notes" db:"notes"`
	CreatedAt      time.Time                `json:"created_at" db:"created_at"`
	Details        []SilageConversionDetail `json:"details"`
}

type SilageConversionDetail struct {
	IDDetail     string  `json:"id_detail" db:"id_detail"`
	IDConversion string  `json:"id_conversion" db:"id_conversion"`
	IDFeed       string  `json:"id_feed" db:"id_feed"`
	Amount       float64 `json:"amount" db:"amount"`
	FeedName     string  `json:"feed_name,omitempty"`
}

type FeedRepository interface {
	FindAllMaster(ctx context.Context) ([]*Feed, error)
	FindMasterByID(ctx context.Context, id string) (*Feed, error)
	StoreMaster(ctx context.Context, p *Feed) error
	UpdateStock(ctx context.Context, id string, amount float64, actionType string) error
	StoreFeeding(ctx context.Context, f *Feeding) error
	FindFeedingHistory(ctx context.Context, idSheep string) ([]*Feeding, error)
	FindAllFeedings(ctx context.Context, filter FeedingFilter) ([]*Feeding, int, error)
	StoreFeedingMixture(ctx context.Context, fm *FeedingMixture) error
	StoreSilageConversion(ctx context.Context, sc *SilageConversion) error
}

type UseCase interface {
	GetMasterFeedList(ctx context.Context) ([]*Feed, error)
	AddMasterFeed(ctx context.Context, p *Feed) error
	UpdateFeedStock(ctx context.Context, id string, amount float64, actionType string) error
	GetFeedRecommendation(ctx context.Context, idSheep string) (*FeedRecommendation, error)
	GetFeedRecommendationByCage(ctx context.Context, idCage string) (*CageFeedRecommendation, error)
	RecordFeeding(ctx context.Context, f *Feeding) error
	GetFeedingHistory(ctx context.Context, idSheep string) ([]*Feeding, error)
	GetFeedingList(ctx context.Context, filter FeedingFilter) ([]*Feeding, int, error)
	RecordFeedingMixture(ctx context.Context, fm *FeedingMixture) error
	RecordSilageConversion(ctx context.Context, sc *SilageConversion) error
}

