package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

// UpdatePregnancyStatus modifies the gestational status of a pregnancy and synchronizes parent sheep status.
func (u *useCase) UpdatePregnancyStatus(ctx context.Context, id string, status string, notes string) (*domain.Pregnancy, error) {
	err := u.repo.UpdatePregnancyStatus(ctx, id, status, notes)
	if err != nil {
		return nil, err
	}

	pregnancy, err := u.repo.GetPregnancyDetail(ctx, id)
	if err == nil && pregnancy != nil {
		if status == "keguguran" {
			u.sheepRepo.UpdateStatus(ctx, pregnancy.IDMother, "aktif", "Keguguran")
		}
	}

	return pregnancy, err
}
