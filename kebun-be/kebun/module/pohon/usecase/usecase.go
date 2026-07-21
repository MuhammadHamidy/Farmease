package usecase

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/farmease/kebun-be/kebun/module/pohon/domain"
)

type pohonUsecase struct {
	repo domain.PohonRepository
}

func NewPohonUsecase(repo domain.PohonRepository) domain.PohonUsecase {
	return &pohonUsecase{repo: repo}
}

func isValidFasePohon(f string) bool {
	switch domain.FasePohon(f) {
	case domain.FasePohonPembibitan,
		domain.FasePohonVegetatif,
		domain.FasePohonGeneratif,
		domain.FasePohonPanen,
		domain.FasePohonTidakProduktif:
		return true
	}
	return false
}

func (u *pohonUsecase) FindAll(ctx context.Context) ([]domain.Pohon, error) {
	return u.repo.FindAll(ctx)
}

func (u *pohonUsecase) FindByID(ctx context.Context, id string) (*domain.Pohon, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *pohonUsecase) Create(ctx context.Context, p *domain.Pohon) error {
	if !isValidFasePohon(p.FasePohon) {
		return errors.New("fase_pohon tidak valid: harus Pembibitan, Vegetatif, Generatif, Panen, atau Belum Produktif")
	}
	p.KodePohon = strings.ToUpper(strings.TrimSpace(p.KodePohon))
	existing, err := u.repo.FindByKodePohon(ctx, p.KodePohon)
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New("kode pohon sudah digunakan")
	}
	if p.StatusPohon == "" {
		p.StatusPohon = "aktif"
	}
	return u.repo.Store(ctx, p)
}

func (u *pohonUsecase) Update(ctx context.Context, p *domain.Pohon) error {
	if !isValidFasePohon(p.FasePohon) {
		return errors.New("fase_pohon tidak valid: harus Pembibitan, Vegetatif, Generatif, Panen, atau Belum Produktif")
	}
	p.KodePohon = strings.ToUpper(strings.TrimSpace(p.KodePohon))
	existing, err := u.repo.FindByID(ctx, p.IDPohon)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("pohon tidak ditemukan")
	}

	if strings.ToLower(existing.StatusPohon) == "tidak aktif" {
		return errors.New("pohon dengan status tidak aktif tidak dapat diedit kembali")
	}

	existingByCode, err := u.repo.FindByKodePohon(ctx, p.KodePohon)
	if err != nil {
		return err
	}
	if existingByCode != nil && existingByCode.IDPohon != p.IDPohon {
		return errors.New("kode pohon sudah digunakan oleh pohon lain")
	}

	if p.StatusPohon == "" {
		p.StatusPohon = "aktif"
	}

	// Cek apakah pohon belum produktif (umur <= 3 tahun) untuk mencegah perubahan fase
	isBelumProduktif := false
	if existing.TanggalTanam != "" {
		parts := strings.Split(existing.TanggalTanam, "T")
		datePart := parts[0]
		t, err := time.Parse("2006-01-02", datePart)
		if err == nil {
			age := time.Now().Year() - t.Year()
			if age <= 3 {
				isBelumProduktif = true
			}
		}
	}

	if isBelumProduktif && p.FasePohon != existing.FasePohon {
		return errors.New("tidak bisa mengubah fase pohon karena status tanaman belum produktif (umur 0-3 tahun)")
	}

	return u.repo.Update(ctx, p)
}

func (u *pohonUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

func (u *pohonUsecase) FindByKodePohon(ctx context.Context, kode string) (*domain.Pohon, error) {
	return u.repo.FindByKodePohon(ctx, kode)
}

