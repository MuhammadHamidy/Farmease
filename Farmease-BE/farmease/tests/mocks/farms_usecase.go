package mocks

import (
"context"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
"github.com/google/uuid"
"github.com/stretchr/testify/mock"
)

type FarmUseCase struct {
mock.Mock
}

func (m *FarmUseCase) Create(ctx context.Context, farm *domain.Farm) error {
args := m.Called(ctx, farm)
return args.Error(0)
}

func (m *FarmUseCase) FindAll(ctx context.Context, param *domain.FarmParam) ([]*domain.Farm, int, error) {
args := m.Called(ctx, param)
return args.Get(0).([]*domain.Farm), args.Int(1), args.Error(2)
}

func (m *FarmUseCase) FindByID(ctx context.Context, id uuid.UUID) (*domain.Farm, error) {
args := m.Called(ctx, id)
if args.Get(0) == nil {
return nil, args.Error(1)
}
return args.Get(0).(*domain.Farm), args.Error(1)
}

func (m *FarmUseCase) Update(ctx context.Context, id uuid.UUID, farm *domain.Farm) error {
args := m.Called(ctx, id, farm)
return args.Error(0)
}

func (m *FarmUseCase) Delete(ctx context.Context, id uuid.UUID, deletedBy string) error {
args := m.Called(ctx, id, deletedBy)
return args.Error(0)
}
