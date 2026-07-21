package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

// UpdateTask modifies properties of an existing task.
func (r *Repository) UpdateTask(ctx context.Context, task *domain.Task) error {
	var startTime *string
	if task.StartTime != "" {
		startTime = &task.StartTime
	}
	var idAccount *string
	if task.IDAccount != "" {
		idAccount = &task.IDAccount
	}
	var scheduleID *string
	if task.ScheduleID != nil && *task.ScheduleID != "" {
		scheduleID = task.ScheduleID
	}
	var idCage *string
	if task.IDCage != nil && *task.IDCage != "" {
		idCage = task.IDCage
	}
	var idMating *string
	if task.IDMating != nil && *task.IDMating != "" {
		idMating = task.IDMating
	}
	var rincian *string
	if task.Rincian != "" {
		rincian = &task.Rincian
	}
	query := `UPDATE operations.tasks SET title = $1, description = $2, task_date = $3, end_time = $4, status = $5, priority = $6, id_account = $7, category = $8, schedule_id = $9, id_cage = $10, start_time = $11::TIME, rincian = $12, id_mating = $13, updated_at = CURRENT_TIMESTAMP WHERE id_task = $14`
	_, err := r.db.Exec(ctx, query, task.Title, task.Description, task.TaskDate, task.EndTime, task.Status, task.Priority, idAccount, task.Category, scheduleID, idCage, startTime, rincian, idMating, task.IDTask)
	return err
}
