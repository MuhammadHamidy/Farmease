package integrations

import (
"context"
"testing"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
farmsRepo "github.com/farmease/farmease-be/farmease/module/farms/repository/postgresql"
"github.com/google/uuid"
"github.com/stretchr/testify/assert"
"github.com/stretchr/testify/require"
)

func TestFarmsRepository(t *testing.T) {
if testPool == nil {
t.Skip("Skipping integration test: testPool is nil")
}
ctx := context.Background()
repo := farmsRepo.NewRepository(testPool)

t.Run("Store_And_FindByID", func(t *testing.T) {
loc := "Bogor"
farm := &domain.Farm{
ID:       uuid.New(),
Code:     "FARM-TEST-001",
Name:     "Test Farm",
Location: &loc,
}
err := repo.Store(ctx, farm)
require.NoError(t, err)

found, err := repo.FindByID(ctx, farm.ID)
require.NoError(t, err)
assert.Equal(t, farm.Code, found.Code)
assert.Equal(t, farm.Name, found.Name)
})

t.Run("FindByCode", func(t *testing.T) {
found, err := repo.FindByCode(ctx, "FARM-TEST-001")
require.NoError(t, err)
assert.NotNil(t, found)
})

t.Run("FindAll", func(t *testing.T) {
farms, total, err := repo.FindAll(ctx, &domain.FarmParam{Limit: 10, Offset: 0})
require.NoError(t, err)
assert.GreaterOrEqual(t, total, 1)
assert.NotEmpty(t, farms)
})

t.Run("FindByID_NotFound", func(t *testing.T) {
found, err := repo.FindByID(ctx, uuid.MustParse("00000000-0000-0000-0000-000000000000"))
require.NoError(t, err)
assert.Nil(t, found)
})
}
