package postgresql

import (
	"context"
	"time"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

// FindByID retrieves a single task by its ID.
func (r *Repository) FindByID(ctx context.Context, id string) (*domain.Task, error) {
	query := `SELECT id_task, title, description, task_date, end_time, status, priority, id_account, category, schedule_id, id_cage, start_time::TEXT, rincian, id_mating, created_at, updated_at FROM operations.tasks WHERE id_task = $1`
	var task domain.Task
	var desc, end, cat, status, priority *string
	var taskDateVal, created, updated *time.Time
	var idAcc, scheduleId, idCage, startTime, rincian, idMating *string
	err := r.db.QueryRow(ctx, query, id).Scan(&task.IDTask, &task.Title, &desc, &taskDateVal, &end, &status, &priority, &idAcc, &cat, &scheduleId, &idCage, &startTime, &rincian, &idMating, &created, &updated)
	if err != nil {
		return nil, err
	}
	if desc != nil {
		task.Description = *desc
	}
	if end != nil {
		task.EndTime = *end
	}
	if cat != nil {
		task.Category = *cat
	}
	if taskDateVal != nil {
		task.TaskDate = *taskDateVal
	}
	if status != nil {
		task.Status = *status
	}
	if priority != nil {
		task.Priority = *priority
	} else {
		task.Priority = "sedang"
	}
	if idAcc != nil {
		task.IDAccount = *idAcc
	}
	task.ScheduleID = scheduleId
	task.IDCage = idCage
	if startTime != nil && len(*startTime) >= 5 {
		task.StartTime = (*startTime)[:5]
	}
	if rincian != nil {
		task.Rincian = *rincian
	}
	task.IDMating = idMating
	if created != nil {
		task.CreatedAt = *created
	}
	if updated != nil {
		task.UpdatedAt = *updated
	}
	return &task, nil
}
