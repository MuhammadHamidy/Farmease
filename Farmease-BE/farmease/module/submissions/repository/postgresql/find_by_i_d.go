package postgresql

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
	"github.com/jackc/pgx/v5"
)

// FindByID retrieves a single submission record by its unique ID.
func (r *Repository) FindByID(ctx context.Context, id string) (*domain.Submission, error) {
	query := `SELECT id_submission, submission_code, type, type_label, operator_code, operator_name, cage_code, scope, summary, payload, submitted_at, approval_status, reviewed_at, reviewed_by, review_note, task_id, created_at, updated_at 
	FROM operations.pencatatan_submissions 
	WHERE id_submission = $1`

	var submission domain.Submission
	var payloadBytes []byte

	err := r.db.QueryRow(ctx, query, id).Scan(
		&submission.ID, &submission.SubmissionCode, &submission.Type, &submission.TypeLabel, &submission.OperatorCode, &submission.OperatorName,
		&submission.CageCode, &submission.Scope, &submission.Summary, &payloadBytes, &submission.SubmittedAt,
		&submission.ApprovalStatus, &submission.ReviewedAt, &submission.ReviewedBy, &submission.ReviewNote,
		&submission.TaskID, &submission.CreatedAt, &submission.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	if len(payloadBytes) > 0 {
		_ = json.Unmarshal(payloadBytes, &submission.Payload)
	}

	return &submission, nil
}
