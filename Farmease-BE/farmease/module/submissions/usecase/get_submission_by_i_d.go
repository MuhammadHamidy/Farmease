package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

// GetSubmissionByID retrieves a single submission record by its unique ID.
func (u *useCase) GetSubmissionByID(ctx context.Context, id string) (*domain.Submission, error) {
	return u.repo.FindByID(ctx, id)
}
