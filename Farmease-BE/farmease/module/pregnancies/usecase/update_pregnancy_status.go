package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

func (u *useCase) UpdatePregnancyStatus(ctx context.Context, id string, status string, notes string) (*domain.Pregnancy, error) {
	err := u.repo.UpdatePregnancyStatus(ctx, id, status, notes)
	if err != nil {
		return nil, err
	}

	p, err := u.repo.GetPregnancyDetail(ctx, id)
	if err == nil && p != nil {
		if status == "keguguran" {
			u.sheepRepo.UpdateStatus(ctx, p.IDMother, "aktif", "Keguguran")
		}
	}

	return p, err
}
