package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

func (u *useCase) GetSubmissionByID(ctx context.Context, id string) (*domain.Submission, error) {
	return u.repo.FindByID(ctx, id)
}
