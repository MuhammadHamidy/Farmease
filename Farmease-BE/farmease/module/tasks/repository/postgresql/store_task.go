package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

func (r *Repository) StoreTask(ctx context.Context, t *domain.Task) error {
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
	query := `INSERT INTO operations.tasks (title, description, task_date, end_time, status, priority, id_account, category, schedule_id, id_cage, start_time, rincian, id_mating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::TIME, $12, $13) RETURNING id_task`
	return r.db.QueryRow(ctx, query, t.Title, t.Description, t.TaskDate, t.EndTime, t.Status, t.Priority, idAccount, t.Category, scheduleID, idCage, st, rincian, idMating).Scan(&t.IDTask)
}
