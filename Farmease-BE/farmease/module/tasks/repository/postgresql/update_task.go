package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

func (r *Repository) UpdateTask(ctx context.Context, t *domain.Task) error {
	var st *string
	if t.StartTime != "" {
		st = &t.StartTime
	}
	var idAccount *string
	if t.IDAccount != "" {
		idAccount = &t.IDAccount
	}
	var scheduleID *string
	if t.ScheduleID != nil && *t.ScheduleID != "" {
		scheduleID = t.ScheduleID
	}
	var idCage *string
	if t.IDCage != nil && *t.IDCage != "" {
		idCage = t.IDCage
	}
	var idMating *string
	if t.IDMating != nil && *t.IDMating != "" {
		idMating = t.IDMating
	}
	var rincian *string
	if t.Rincian != "" {
		rincian = &t.Rincian
	}
	query := `UPDATE operations.tasks SET title = $1, description = $2, task_date = $3, end_time = $4, status = $5, priority = $6, id_account = $7, category = $8, schedule_id = $9, id_cage = $10, start_time = $11::TIME, rincian = $12, id_mating = $13, updated_at = CURRENT_TIMESTAMP WHERE id_task = $14`
	_, err := r.db.Exec(ctx, query, t.Title, t.Description, t.TaskDate, t.EndTime, t.Status, t.Priority, idAccount, t.Category, scheduleID, idCage, st, rincian, idMating, t.IDTask)
	return err
}
