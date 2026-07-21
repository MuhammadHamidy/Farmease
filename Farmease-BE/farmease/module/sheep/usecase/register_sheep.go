package usecase

import (
	"context"
	"strings"
	"time"
	"fmt"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

// RegisterSheep inserts a new sheep record into the repository.
// If the age method is set to "poel" (teeth wear check), it approximates the DateOfBirth 
// by subtracting months based on the dentition level:
//   - "Cempe" (lamb): subtracts 6 months
//   - Poel 1 (1 pair of permanent incisors): subtracts 15 months
//   - Poel 2 (2 pairs of permanent incisors): subtracts 21 months
//   - Poel 3 (3 pairs of permanent incisors): subtracts 30 months
//   - Poel 4+ (full mouth/older): subtracts 40 months
func (u *useCase) RegisterSheep(ctx context.Context, sheep *domain.Sheep) error {
	if sheep.UmurMethod == "poel" {
		estimatedBirthDate := time.Now()
		if strings.HasPrefix(sheep.PoelLevel, "Cempe") {
			estimatedBirthDate = estimatedBirthDate.AddDate(0, -6, 0)
		} else if strings.HasPrefix(sheep.PoelLevel, "1") {
			estimatedBirthDate = estimatedBirthDate.AddDate(0, -15, 0)
		} else if strings.HasPrefix(sheep.PoelLevel, "2") {
			estimatedBirthDate = estimatedBirthDate.AddDate(0, -21, 0)
		} else if strings.HasPrefix(sheep.PoelLevel, "3") {
			estimatedBirthDate = estimatedBirthDate.AddDate(0, -30, 0)
		} else {
			estimatedBirthDate = estimatedBirthDate.AddDate(0, -40, 0)
		}
		sheep.DateOfBirth = &estimatedBirthDate
	}

	return u.repo.Store(ctx, sheep)
}

// GetOrCreateExternalDonor fetches an external ram donor by name and origin.
// If not found, it generates a new donor record with a timestamped code (DN-YYMMDDHHMMSS).
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
