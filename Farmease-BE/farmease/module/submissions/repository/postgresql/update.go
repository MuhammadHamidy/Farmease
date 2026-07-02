package postgresql

import (
	"context"
	"encoding/json"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

func (r *Repository) Update(ctx context.Context, s *domain.Submission) error {
	payloadBytes, err := json.Marshal(s.Payload)
	if err != nil {
		return err
	}

	query := `UPDATE operations.pencatatan_submissions SET 
		submission_code = $1, type = $2, type_label = $3, operator_code = $4, operator_name = $5, cage_code = $6, 
		scope = $7, summary = $8, payload = $9, submitted_at = $10, approval_status = $11, 
		reviewed_at = $12, reviewed_by = $13, review_note = $14, task_id = $15, updated_at = CURRENT_TIMESTAMP 
	WHERE id_submission = $16`

	_, err = r.db.Exec(ctx, query,
		s.SubmissionCode, s.Type, s.TypeLabel, s.OperatorCode, s.OperatorName, s.CageCode, s.Scope, s.Summary,
		payloadBytes, s.SubmittedAt, s.ApprovalStatus, s.ReviewedAt, s.ReviewedBy, s.ReviewNote, s.TaskID,
		s.ID,
	)
	return err
}
