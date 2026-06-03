package domain

import (
"context"
"time"

"github.com/google/uuid"
)

type Farm struct {
ID          uuid.UUID  `json:"id" db:"id"`
Code        string     `json:"code" db:"code"`
Name        string     `json:"name" db:"name"`
Location    *string    `json:"location" db:"location"`
Description *string    `json:"description" db:"description"`
CreatedAt   time.Time  `json:"createdAt" db:"created_at"`
CreatedBy   *string    `json:"createdBy" db:"created_by"`
UpdatedAt   *time.Time `json:"updatedAt" db:"updated_at"`
UpdatedBy   *string    `json:"updatedBy" db:"updated_by"`
DeletedAt   *time.Time `json:"deletedAt" db:"deleted_at"`
DeletedBy   *string    `json:"deletedBy" db:"deleted_by"`
}

type FarmParam struct {
Limit  int
Offset int
Code   string
Name   string
}

type FarmRepository interface {
Store(ctx context.Context, farm *Farm) error
FindAll(ctx context.Context, param *FarmParam) ([]*Farm, int, error)
FindByID(ctx context.Context, id uuid.UUID) (*Farm, error)
FindByCode(ctx context.Context, code string) (*Farm, error)
Update(ctx context.Context, farm *Farm) error
Delete(ctx context.Context, id uuid.UUID, deletedBy string) error
}
