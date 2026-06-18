package usecase

import (
	"context"
	"errors"
	"strings"

	"github.com/farmease/farmease-be/farmease/module/pencatatan_types/domain"
)

type usecase struct {
	repo domain.Repository
}

func NewUsecase(repo domain.Repository) domain.Usecase {
	return &usecase{repo: repo}
}

func (u *usecase) GetCatalog(ctx context.Context) (*domain.Catalog, error) {
	jenisList, err := u.repo.FindAllJenis(ctx)
	if err != nil {
		return nil, err
	}

	rincianList, err := u.repo.FindAllRincian(ctx)
	if err != nil {
		return nil, err
	}

	rincianByJenis := make(map[string][]domain.RincianPencatatan)
	for _, item := range rincianList {
		rincianByJenis[item.JenisNama] = append(rincianByJenis[item.JenisNama], item)
	}

	return &domain.Catalog{
		Jenis:          jenisList,
		RincianByJenis: rincianByJenis,
	}, nil
}

func (u *usecase) GetRincianByJenisNama(ctx context.Context, jenisNama string) ([]domain.RincianPencatatan, error) {
	jenis, err := u.repo.FindJenisByNama(ctx, jenisNama)
	if err != nil {
		return nil, err
	}
	if jenis == nil {
		return []domain.RincianPencatatan{}, nil
	}
	return u.repo.FindRincianByJenisID(ctx, jenis.IDJenis)
}

func (u *usecase) CreateJenis(ctx context.Context, input domain.CreateJenisInput) (*domain.JenisPencatatan, error) {
	nama := strings.TrimSpace(input.Nama)
	if nama == "" {
		return nil, errors.New("nama jenis pencatatan wajib diisi")
	}

	sortOrder := 0
	if input.SortOrder != nil {
		sortOrder = *input.SortOrder
	}

	j := &domain.JenisPencatatan{
		Nama:      nama,
		SortOrder: sortOrder,
	}
	if err := u.repo.StoreJenis(ctx, j); err != nil {
		return nil, err
	}
	return j, nil
}

func (u *usecase) CreateRincian(ctx context.Context, input domain.CreateRincianInput) (*domain.RincianPencatatan, error) {
	nama := strings.TrimSpace(input.Nama)
	if nama == "" {
		return nil, errors.New("nama rincian pencatatan wajib diisi")
	}

	var jenisID string
	switch {
	case strings.TrimSpace(input.JenisID) != "":
		jenisID = strings.TrimSpace(input.JenisID)
	case strings.TrimSpace(input.JenisNama) != "":
		jenis, err := u.repo.FindJenisByNama(ctx, strings.TrimSpace(input.JenisNama))
		if err != nil {
			return nil, err
		}
		if jenis == nil {
			return nil, errors.New("jenis pencatatan tidak ditemukan")
		}
		jenisID = jenis.IDJenis
	default:
		return nil, errors.New("jenis_id atau jenis_nama wajib diisi")
	}

	sortOrder := 0
	if input.SortOrder != nil {
		sortOrder = *input.SortOrder
	}

	item := &domain.RincianPencatatan{
		JenisID:   jenisID,
		JenisNama: strings.TrimSpace(input.JenisNama),
		Nama:      nama,
		SortOrder: sortOrder,
	}
	if err := u.repo.StoreRincian(ctx, item); err != nil {
		return nil, err
	}
	return item, nil
}
