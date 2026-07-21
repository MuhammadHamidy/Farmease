package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

// UpdateHealth modifies diagnostic findings or treatment details of an existing health record.
func (u *useCase) UpdateHealth(ctx context.Context, id string, healthRecord *domain.Health) error {
	healthRecord.IDHealth = id
	return u.repo.Update(ctx, healthRecord)
}
