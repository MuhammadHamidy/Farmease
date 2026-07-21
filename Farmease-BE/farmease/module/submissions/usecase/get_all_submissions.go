package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

// GetAllSubmissions retrieves all submission records filtered by status and category type.
func (u *useCase) GetAllSubmissions(ctx context.Context, status, submissionType string) ([]*domain.Submission, error) {
	return u.repo.FindAll(ctx, status, submissionType)
}
