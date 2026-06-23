package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/farmease/farmease-be/farmease/config"
	"github.com/farmease/farmease-be/farmease/module/perawatan/domain"
)

type perawatanUsecase struct {
	repo domain.PerawatanRepository
	cfg  *config.InternalAppConfig
}

func NewPerawatanUsecase(repo domain.PerawatanRepository, cfg *config.InternalAppConfig) domain.PerawatanUsecase {
	return &perawatanUsecase{repo: repo, cfg: cfg}
}

func (u *perawatanUsecase) FindAll(ctx context.Context) ([]domain.Perawatan, error) {
	return u.repo.FindAll(ctx)
}

func (u *perawatanUsecase) FindByID(ctx context.Context, id string) (*domain.Perawatan, error) {
	return u.repo.FindByID(ctx, id)
}

type ManureItem struct {
	IDManure string `json:"id_manure"`
	Tipe     string `json:"tipe"`
	Jumlah   int    `json:"jumlah"`
	Satuan   string `json:"satuan"`
}

type ManureResponse struct {
	Status  string       `json:"status"`
	Message string       `json:"message"`
	Data    []ManureItem `json:"data"`
}

func (u *perawatanUsecase) Create(ctx context.Context, p *domain.Perawatan) error {
	// If technique is Pemupukan (Fertilization), integrate manure from external Livestock Web API
	if p.NamaJenisAktivitas == "Pemupukan" {
		u.fetchManureFromLivestock()
	}

	return u.repo.Store(ctx, p)
}

func (u *perawatanUsecase) Update(ctx context.Context, p *domain.Perawatan) error {
	if p.NamaJenisAktivitas == "Pemupukan" {
		u.fetchManureFromLivestock()
	}
	return u.repo.Update(ctx, p)
}

func (u *perawatanUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

func (u *perawatanUsecase) GetRekomendasiObat(ctx context.Context, varietas, fase, obat string) (string, error) {
	if varietas == "" {
		varietas = "Alpukat Aligator"
	}
	if fase == "" || fase == "Fase Pohon" {
		fase = "Vegetatif"
	}
	if obat == "" {
		obat = "Ekstrak Nimba"
	}
	return fmt.Sprintf("Varietas <strong>%s</strong> dengan fase <strong>%s</strong> menggunakan <strong>%s</strong> dengan dosesi sebanyak <strong>2-3 mL/Liter air</strong>.", varietas, fase, obat), nil
}

func (u *perawatanUsecase) fetchManureFromLivestock() {
	baseURL := u.cfg.LivestockAPIURL
	if baseURL == "" {
		baseURL = "http://localhost:8081/api/v1"
	}

	client := &http.Client{Timeout: 3 * time.Second}
	url := fmt.Sprintf("%s/manures", baseURL)

	resp, err := client.Get(url)
	if err != nil {
		fmt.Printf("[Warning] Failed to fetch manure from Livestock API: %v\n", err)
		return
	}
	defer resp.Body.Close()

	var apiRes ManureResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiRes); err != nil {
		fmt.Printf("[Warning] Failed to parse manure data from Livestock API: %v\n", err)
		return
	}

	fmt.Printf("[Info] Successfully fetched %d manure records from Livestock API\n", len(apiRes.Data))
}
