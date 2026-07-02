package domain

import (
	"context"
	"time"
)

type Submission struct {
	ID             string                 `json:"id_submission" db:"id_submission"`
	SubmissionCode string                 `json:"submission_code" db:"submission_code"`
	Type           string                 `json:"type" db:"type" validate:"required"`
	TypeLabel      string                 `json:"typeLabel" db:"type_label" validate:"required"`
	OperatorCode   string                 `json:"operatorCode" db:"operator_code" validate:"required"`
	OperatorName   string                 `json:"operatorName" db:"operator_name" validate:"required"`
	CageCode       string                 `json:"cageCode" db:"cage_code" validate:"required"`
	Scope          string                 `json:"scope" db:"scope" validate:"required"`
	Summary        string                 `json:"summary" db:"summary" validate:"required"`
	Payload        map[string]interface{} `json:"payload" db:"payload"`
	SubmittedAt    time.Time              `json:"submittedAt" db:"submitted_at"`
	ApprovalStatus string                 `json:"approvalStatus" db:"approval_status" validate:"required,oneof=pending approved rejected"`
	ReviewedAt     *time.Time             `json:"reviewedAt,omitempty" db:"reviewed_at"`
	ReviewedBy     *string                `json:"reviewedBy,omitempty" db:"reviewed_by"`
	ReviewNote     *string                `json:"reviewNote,omitempty" db:"review_note"`
	TaskID         *string                `json:"taskId,omitempty" db:"task_id"`
	CreatedAt      time.Time              `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time              `json:"updatedAt" db:"updated_at"`
}

type SubmissionRepository interface {
	FindAll(ctx context.Context, status, submissionType string) ([]*Submission, error)
	FindByID(ctx context.Context, id string) (*Submission, error)
	Store(ctx context.Context, s *Submission) error
	Update(ctx context.Context, s *Submission) error
	Delete(ctx context.Context, id string) error
}

type UseCase interface {
	GetAllSubmissions(ctx context.Context, status, submissionType string) ([]*Submission, error)
	GetSubmissionByID(ctx context.Context, id string) (*Submission, error)
	CreateSubmission(ctx context.Context, s *Submission) error
	UpdateSubmission(ctx context.Context, id string, patch *Submission) error
	DeleteSubmission(ctx context.Context, id string) error
}
