package postgresql

import (
	"context"
	"encoding/json"
	"time"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

func (r *Repository) Store(ctx context.Context, s *domain.Submission) error {
	payloadBytes, err := json.Marshal(s.Payload)
	if err != nil {
		return err
	}

	if s.SubmittedAt.IsZero() {
		s.SubmittedAt = time.Now()
	}

	query := `INSERT INTO operations.pencatatan_submissions (
		id_submission, submission_code, type, type_label, operator_code, operator_name, cage_code, scope, summary, 
		payload, submitted_at, approval_status, reviewed_at, reviewed_by, review_note, task_id
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`

	_, err = r.db.Exec(ctx, query,
		s.ID, s.SubmissionCode, s.Type, s.TypeLabel, s.OperatorCode, s.OperatorName, s.CageCode, s.Scope, s.Summary,
		payloadBytes, s.SubmittedAt, s.ApprovalStatus, s.ReviewedAt, s.ReviewedBy, s.ReviewNote, s.TaskID,
	)
	return err
}
