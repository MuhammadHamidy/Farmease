package postgresql

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

func (r *Repository) FindAll(ctx context.Context, status, submissionType string) ([]*domain.Submission, error) {
	query := `SELECT id_submission, submission_code, type, type_label, operator_code, operator_name, cage_code, scope, summary, payload, submitted_at, approval_status, reviewed_at, reviewed_by, review_note, task_id, created_at, updated_at 
	FROM operations.pencatatan_submissions 
	WHERE 1=1`
	args := []interface{}{}
	argIdx := 1

	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND approval_status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}

	if submissionType != "" {
		if submissionType == "peternakan" {
			query += " AND LOWER(type) IN ('pakan', 'kesehatan', 'kotoran', 'perkawinan', 'kelahiran', 'berat_badan', 'stok_pakan', 'weighing')"
		} else if submissionType == "perkebunan" {
			query += " AND LOWER(type) NOT IN ('pakan', 'kesehatan', 'kotoran', 'perkawinan', 'kelahiran', 'berat_badan', 'stok_pakan', 'weighing')"
		}
	}

	query += " ORDER BY submitted_at DESC"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Submission
	for rows.Next() {
		var s domain.Submission
		var payloadBytes []byte

		err := rows.Scan(
			&s.ID, &s.SubmissionCode, &s.Type, &s.TypeLabel, &s.OperatorCode, &s.OperatorName,
			&s.CageCode, &s.Scope, &s.Summary, &payloadBytes, &s.SubmittedAt,
			&s.ApprovalStatus, &s.ReviewedAt, &s.ReviewedBy, &s.ReviewNote,
			&s.TaskID, &s.CreatedAt, &s.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		if len(payloadBytes) > 0 {
			_ = json.Unmarshal(payloadBytes, &s.Payload)
		}

		list = append(list, &s)
	}

	return list, nil
}
