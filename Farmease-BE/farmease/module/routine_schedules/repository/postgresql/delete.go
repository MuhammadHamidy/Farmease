package postgresql

import (
	"context"
)

func (r *routineScheduleRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, "DELETE FROM operations.routine_schedules WHERE id = $1", id)
	return err
}
