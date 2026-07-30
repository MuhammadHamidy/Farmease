package postgresql

import (
	"context"
)

// GetAncestors resolves a map of ancestor IDs and their generational generation distance.
func (r *Repository) GetAncestors(ctx context.Context, id string, maxGeneration int) (map[string][]int, error) {
	ancestors := make(map[string][]int)
	r.getAncestorsRecursive(ctx, id, 0, maxGeneration, ancestors)
	return ancestors, nil
}
