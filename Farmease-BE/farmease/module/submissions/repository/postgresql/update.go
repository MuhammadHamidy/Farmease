package postgresql

import (
	"context"
	"encoding/json"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

// Update updates fields of an existing submission.
func (r *Repository) Update(ctx context.Context, submission *domain.Submission) error {
	payloadBytes, err := json.Marshal(submission.Payload)
	if err != nil {
		return err
	}

	query := `UPDATE operations.pencatatan_submissions SET 
		submission_code = $1, type = $2, type_label = $3, operator_code = $4, operator_name = $5, cage_code = $6, 
		scope = $7, summary = $8, payload = $9, submitted_at = $10, approval_status = $11, 
		reviewed_at = $12, reviewed_by = $13, review_note = $14, task_id = $15, updated_at = CURRENT_TIMESTAMP 
	WHERE id_submission = $16`

	_, err = r.db.Exec(ctx, query,
		submission.SubmissionCode, submission.Type, submission.TypeLabel, submission.OperatorCode, submission.OperatorName, submission.CageCode, submission.Scope, submission.Summary,
		payloadBytes, submission.SubmittedAt, submission.ApprovalStatus, submission.ReviewedAt, submission.ReviewedBy, submission.ReviewNote, submission.TaskID,
		submission.ID,
	)
	return err
}
