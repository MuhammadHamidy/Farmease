package postgresql

import (
	"context"
	"encoding/json"
	"time"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

// Store inserts a new submission log record.
func (r *Repository) Store(ctx context.Context, submission *domain.Submission) error {
	payloadBytes, err := json.Marshal(submission.Payload)
	if err != nil {
		return err
	}

	if submission.SubmittedAt.IsZero() {
		submission.SubmittedAt = time.Now()
	}

	query := `INSERT INTO operations.pencatatan_submissions (
		id_submission, submission_code, type, type_label, operator_code, operator_name, cage_code, scope, summary, 
		payload, submitted_at, approval_status, reviewed_at, reviewed_by, review_note, task_id
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`

	_, err = r.db.Exec(ctx, query,
		submission.ID, submission.SubmissionCode, submission.Type, submission.TypeLabel, submission.OperatorCode, submission.OperatorName, submission.CageCode, submission.Scope, submission.Summary,
		payloadBytes, submission.SubmittedAt, submission.ApprovalStatus, submission.ReviewedAt, submission.ReviewedBy, submission.ReviewNote, submission.TaskID,
	)
	return err
}
