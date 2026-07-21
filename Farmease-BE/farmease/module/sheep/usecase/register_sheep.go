package usecase

import (
	"context"
	"strings"
	"time"
	"fmt"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (u *useCase) RegisterSheep(ctx context.Context, sheep *domain.Sheep) error {
	if sheep.UmurMethod == "poel" {
		d := time.Now()
		if strings.HasPrefix(sheep.PoelLevel, "Cempe") {
			d = d.AddDate(0, -6, 0)
		} else if strings.HasPrefix(sheep.PoelLevel, "1") {
			d = d.AddDate(0, -15, 0)
		} else if strings.HasPrefix(sheep.PoelLevel, "2") {
			d = d.AddDate(0, -21, 0)
		} else if strings.HasPrefix(sheep.PoelLevel, "3") {
			d = d.AddDate(0, -30, 0)
		} else {
			d = d.AddDate(0, -40, 0)
		}
		sheep.DateOfBirth = &d
	}

	return u.repo.Store(ctx, sheep)
}

func (u *useCase) GetOrCreateExternalDonor(ctx context.Context, name, origin string) (*domain.Sheep, error) {
	// Look up if exists
	donor, err := u.repo.FindExternalDonor(ctx, name, origin)
	if err == nil && donor != nil {
		return donor, nil
	}

	// Create new external donor stub
	// Unique code: DN-YYMMDDHHMMSS
	code := fmt.Sprintf("DN-%s", time.Now().Format("060102150405"))

	newDonor := &domain.Sheep{
		SheepCode: code,
		SheepName: name,
		Gender:    "jantan",
		Status:    "eksternal",
		Origin:    origin,
	}

	err = u.repo.Store(ctx, newDonor)
	if err != nil {
		return nil, err
	}

	return newDonor, nil
}
