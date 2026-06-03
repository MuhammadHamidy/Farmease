package domain

import (
	"context"
	"time"
)

type Feed struct {
	IDFeed           int       `json:"id_feed" db:"id_feed"`
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
	IDFeeding   int       `json:"id_feeding" db:"id_feeding"`
	IDSheep     int       `json:"id_sheep" db:"id_sheep"`
	IDFeed      int       `json:"id_feed" db:"id_feed"`
	FeedingDate time.Time `json:"feeding_date" db:"feeding_date"`
	Amount      float64   `json:"amount" db:"amount"`
	Unit        string    `json:"unit" db:"unit"`
	Notes       string    `json:"notes" db:"notes"`
	FeedName    string    `json:"feed_name,omitempty" db:"feed_name"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type FeedRecommendation struct {
	IDSheep            int                  `json:"id_sheep"`
	SheepName          string               `json:"sheep_name"`
	WeightKg           float64              `json:"weight_kg"`
	Status             string               `json:"status"`
	RekomendasiHarian  []RecommendationItem `json:"rekomendasi_harian"`
	TotalPakanHarianKg float64              `json:"total_pakan_harian_kg"`
}

type CageFeedRecommendation struct {
	IDCage            int     `json:"id_kandang"`
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
	IDSheep int
	Page    int
	PerPage int
}

type FeedRepository interface {
	FindAllMaster(ctx context.Context) ([]*Feed, error)
	FindMasterByID(ctx context.Context, id int) (*Feed, error)
	StoreMaster(ctx context.Context, p *Feed) error
	UpdateStock(ctx context.Context, id int, amount float64, actionType string) error
	StoreFeeding(ctx context.Context, f *Feeding) error
	FindFeedingHistory(ctx context.Context, idSheep int) ([]*Feeding, error)
	FindAllFeedings(ctx context.Context, filter FeedingFilter) ([]*Feeding, int, error)
}

type UseCase interface {
	GetMasterFeedList(ctx context.Context) ([]*Feed, error)
	AddMasterFeed(ctx context.Context, p *Feed) error
	UpdateFeedStock(ctx context.Context, id int, amount float64, actionType string) error
	GetFeedRecommendation(ctx context.Context, idSheep int) (*FeedRecommendation, error)
	GetFeedRecommendationByCage(ctx context.Context, idCage int) (*CageFeedRecommendation, error)
	RecordFeeding(ctx context.Context, f *Feeding) error
	GetFeedingHistory(ctx context.Context, idSheep int) ([]*Feeding, error)
	GetFeedingList(ctx context.Context, filter FeedingFilter) ([]*Feeding, int, error)
}

