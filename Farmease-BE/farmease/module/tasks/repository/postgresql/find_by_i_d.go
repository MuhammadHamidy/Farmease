package postgresql

import (
	"context"
	"time"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

func (r *Repository) FindByID(ctx context.Context, id string) (*domain.Task, error) {
	query := `SELECT id_task, title, description, task_date, end_time, status, priority, id_account, category, schedule_id, id_cage, start_time::TEXT, rincian, id_mating, created_at, updated_at FROM operations.tasks WHERE id_task = $1`
	var t domain.Task
	var desc, end, cat, status, priority *string
	var taskDate, created, updated *time.Time
	var idAcc, scheduleId, idCage, startTime, rincian, idMating *string
	err := r.db.QueryRow(ctx, query, id).Scan(&t.IDTask, &t.Title, &desc, &taskDate, &end, &status, &priority, &idAcc, &cat, &scheduleId, &idCage, &startTime, &rincian, &idMating, &created, &updated)
	if err != nil {
		return nil, err
	}
	if desc != nil {
		t.Description = *desc
	}
	if end != nil {
		t.EndTime = *end
	}
	if cat != nil {
		t.Category = *cat
	}
	if taskDate != nil {
		t.TaskDate = *taskDate
	}
	if status != nil {
		t.Status = *status
	}
	if priority != nil {
		t.Priority = *priority
	} else {
		t.Priority = "sedang"
	}
	if idAcc != nil {
		t.IDAccount = *idAcc
	}
	t.ScheduleID = scheduleId
	t.IDCage = idCage
	if startTime != nil && len(*startTime) >= 5 {
		t.StartTime = (*startTime)[:5]
	}
	if rincian != nil {
		t.Rincian = *rincian
	}
	t.IDMating = idMating
	if created != nil {
		t.CreatedAt = *created
	}
	if updated != nil {
		t.UpdatedAt = *updated
	}
	return &t, nil
}
