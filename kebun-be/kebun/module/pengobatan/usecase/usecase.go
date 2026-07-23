package usecase

import (
	"context"
	"fmt"

	"strings"

	"github.com/farmease/kebun-be/kebun/config"
	"github.com/farmease/kebun-be/kebun/module/pengobatan/domain"
)

type pengobatanUsecase struct {
	repo domain.PengobatanRepository
	cfg  *config.InternalAppConfig
}

func NewPengobatanUsecase(repo domain.PengobatanRepository, cfg *config.InternalAppConfig) domain.PengobatanUsecase {
	return &pengobatanUsecase{repo: repo, cfg: cfg}
}

func (u *pengobatanUsecase) FindAll(ctx context.Context) ([]domain.Pengobatan, error) {
	return u.repo.FindAll(ctx)
}

func (u *pengobatanUsecase) FindByID(ctx context.Context, id string) (*domain.Pengobatan, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *pengobatanUsecase) Create(ctx context.Context, p *domain.Pengobatan) error {
	return u.repo.Store(ctx, p)
}

func (u *pengobatanUsecase) Update(ctx context.Context, p *domain.Pengobatan) error {
	return u.repo.Update(ctx, p)
}

func (u *pengobatanUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

func (u *pengobatanUsecase) GetRekomendasiObat(ctx context.Context, varietas, fase, obat string) (string, error) {
	vLower := strings.ToLower(varietas)
	oLower := strings.ToLower(obat)

	// Lengkeng
	if strings.Contains(vLower, "lengkeng") || strings.Contains(vLower, "kelengkeng") {
		if strings.Contains(oLower, "sabun") {
			return "Untuk tanaman Lengkeng mengendalikan Kutu Putih: Gunakan <strong>Sabun cuci piring</strong> dosis <strong>1 ml/liter air</strong> (setara 20 tetes/L).", nil
		}
		if strings.Contains(oLower, "cengkeh") || strings.Contains(oLower, "nimba") || strings.Contains(oLower, "sereh") {
			return "Untuk tanaman Lengkeng mengendalikan Kutu Putih: Gunakan <strong>Minyak cengkeh/nimba/sereh wangi</strong> dosis <strong>2 ml/liter air</strong> (setara 40 tetes/L). Waktu aplikasi: <em>2 minggu setelah bunga, 1 bulan sebelum panen</em>.", nil
		}
		return "Untuk tanaman Lengkeng: Gunakan <strong>Minyak nabati / Sabun cuci piring</strong> dosis <strong>1-2 ml/liter air</strong>.", nil
	}

	// Alpukat (Default / Alpukat)
	if strings.Contains(oLower, "trichoderma") {
		return "Untuk tanaman Alpukat mengendalikan Kanker Batang & Busuk Akar: Taburkan <strong>Trichoderma</strong> sebanyak <strong>250 gram/batang</strong> di area perakaran.", nil
	}
	if strings.Contains(oLower, "pupuk organik") {
		return "Untuk pencegahan Kanker Batang & Busuk Akar pada Alpukat: Berikan <strong>Pupuk Organik</strong> sebanyak <strong>20 kg/batang</strong> secara memutar di sekeliling tajuk.", nil
	}
	if strings.Contains(oLower, "perangkap") || strings.Contains(oLower, "methyl") || strings.Contains(oLower, "eugenol") {
		return "Untuk mengendalikan Lalat Buah pada Alpukat: Pasang <strong>Perangkap Atraktan (Methyl Eugenol)</strong> sebanyak <strong>20 perangkap/hektar</strong>.", nil
	}
	if strings.Contains(oLower, "deterjen") {
		return "Untuk mengendalikan Tungau Merah/Kutu Putih pada Alpukat: Larutkan <strong>Deterjen cair</strong> dosis <strong>1 cc/liter air</strong> (setara 20 tetes/L air).", nil
	}
	if strings.Contains(oLower, "sereh") {
		return "Untuk mengendalikan Tungau Merah pada Alpukat: Larutkan <strong>Minyak sereh wangi</strong> dosis <strong>2 cc/liter air</strong> (setara 40 tetes/L air).", nil
	}

	if varietas == "" {
		varietas = "Alpukat"
	}
	if fase == "" || fase == "Fase Pohon" {
		fase = "Vegetatif"
	}
	if obat == "" {
		obat = "Minyak Sereh Wangi"
	}
	return fmt.Sprintf("Varietas <strong>%s</strong> (%s) menggunakan <strong>%s</strong> dengan dosis anjuran <strong>1-2 cc/Liter air</strong> (20-40 tetes/L).", varietas, fase, obat), nil
}

