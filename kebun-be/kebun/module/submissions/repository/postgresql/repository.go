package postgresql

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindAll(ctx context.Context, status, submissionType string) ([]*domain.Submission, error) {
	query := `SELECT id, type, type_label, operator_code, operator_name, cage_code, scope, summary, payload, submitted_at, approval_status, reviewed_at, reviewed_by, review_note, task_id, created_at, updated_at 
	FROM gardening.pencatatan_submissions 
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
			&s.ID, &s.Type, &s.TypeLabel, &s.OperatorCode, &s.OperatorName,
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

func (r *Repository) FindByID(ctx context.Context, id string) (*domain.Submission, error) {
	query := `SELECT id, type, type_label, operator_code, operator_name, cage_code, scope, summary, payload, submitted_at, approval_status, reviewed_at, reviewed_by, review_note, task_id, created_at, updated_at 
	FROM gardening.pencatatan_submissions 
	WHERE id = $1`

	var s domain.Submission
	var payloadBytes []byte

	err := r.db.QueryRow(ctx, query, id).Scan(
		&s.ID, &s.Type, &s.TypeLabel, &s.OperatorCode, &s.OperatorName,
		&s.CageCode, &s.Scope, &s.Summary, &payloadBytes, &s.SubmittedAt,
		&s.ApprovalStatus, &s.ReviewedAt, &s.ReviewedBy, &s.ReviewNote,
		&s.TaskID, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	if len(payloadBytes) > 0 {
		_ = json.Unmarshal(payloadBytes, &s.Payload)
	}

	return &s, nil
}

func (r *Repository) Store(ctx context.Context, s *domain.Submission) error {
	payloadBytes, err := json.Marshal(s.Payload)
	if err != nil {
		return err
	}

	if s.SubmittedAt.IsZero() {
		s.SubmittedAt = time.Now()
	}

	query := `INSERT INTO gardening.pencatatan_submissions (
		id, type, type_label, operator_code, operator_name, cage_code, scope, summary, 
		payload, submitted_at, approval_status, reviewed_at, reviewed_by, review_note, task_id
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`

	_, err = r.db.Exec(ctx, query,
		s.ID, s.Type, s.TypeLabel, s.OperatorCode, s.OperatorName, s.CageCode, s.Scope, s.Summary,
		payloadBytes, s.SubmittedAt, s.ApprovalStatus, s.ReviewedAt, s.ReviewedBy, s.ReviewNote, s.TaskID,
	)
	return err
}

func (r *Repository) Update(ctx context.Context, s *domain.Submission) error {
	payloadBytes, err := json.Marshal(s.Payload)
	if err != nil {
		return err
	}

	query := `UPDATE gardening.pencatatan_submissions SET 
		type = $1, type_label = $2, operator_code = $3, operator_name = $4, cage_code = $5, 
		scope = $6, summary = $7, payload = $8, submitted_at = $9, approval_status = $10, 
		reviewed_at = $11, reviewed_by = $12, review_note = $13, task_id = $14, updated_at = CURRENT_TIMESTAMP 
	WHERE id = $15`

	_, err = r.db.Exec(ctx, query,
		s.Type, s.TypeLabel, s.OperatorCode, s.OperatorName, s.CageCode, s.Scope, s.Summary,
		payloadBytes, s.SubmittedAt, s.ApprovalStatus, s.ReviewedAt, s.ReviewedBy, s.ReviewNote, s.TaskID,
		s.ID,
	)
	return err
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM gardening.pencatatan_submissions WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
