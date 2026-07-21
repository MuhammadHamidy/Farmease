package postgresql

import (
	"context"
)

func (r *Repository) GetAncestors(ctx context.Context, id string, maxGeneration int) (map[string][]int, error) {
	ancestors := make(map[string][]int)
	r.getAncestorsRecursive(ctx, id, 0, maxGeneration, ancestors)
	return ancestors, nil
}
