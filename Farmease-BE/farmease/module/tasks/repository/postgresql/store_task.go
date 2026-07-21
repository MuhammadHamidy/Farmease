package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

// StoreTask creates a new task record in the database.
func (r *Repository) StoreTask(ctx context.Context, task *domain.Task) error {
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
	query := `INSERT INTO operations.tasks (title, description, task_date, end_time, status, priority, id_account, category, schedule_id, id_cage, start_time, rincian, id_mating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::TIME, $12, $13) RETURNING id_task`
	return r.db.QueryRow(ctx, query, task.Title, task.Description, task.TaskDate, task.EndTime, task.Status, task.Priority, idAccount, task.Category, scheduleID, idCage, startTime, rincian, idMating).Scan(&task.IDTask)
}
