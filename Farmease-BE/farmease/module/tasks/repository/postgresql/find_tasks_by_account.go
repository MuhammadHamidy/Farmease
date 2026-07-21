package postgresql

import (
	"context"
	"time"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

// FindTasksByAccount lists all tasks assigned to an account, filtered by date.
func (r *Repository) FindTasksByAccount(ctx context.Context, idAccount, roleName string, date *time.Time) ([]*domain.Task, error) {
	// If Admin, they can see all tasks.
	// If Operator (e.g. Operator Kandang), they can only see their own tasks.
	query := `SELECT t.id_task, t.title, t.description, t.task_date, t.end_time, t.status, t.priority, t.id_account, t.category, t.schedule_id, t.id_cage, t.start_time::TEXT, t.rincian, t.id_mating, t.created_at, t.updated_at 
FROM operations.tasks t 
WHERE ($1 = 'Admin' OR t.id_account = $2)`
	args := []interface{}{roleName, idAccount}
	if date != nil {
		query += " AND (t.task_date AT TIME ZONE 'Asia/Jakarta')::DATE = $3::DATE"
		args = append(args, date.Format("2006-01-02"))
	}
	query += " ORDER BY CASE WHEN t.priority = 'tinggi' THEN 1 WHEN t.priority = 'sedang' THEN 2 WHEN t.priority = 'rendah' THEN 3 ELSE 4 END ASC, t.task_date ASC"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var taskList []*domain.Task
	for rows.Next() {
		var task domain.Task
		var desc, end, cat, status, priority *string
		var taskDateVal, created, updated *time.Time
		var idAcc, scheduleId, idCage, startTime, rincian, idMating *string
		err := rows.Scan(&task.IDTask, &task.Title, &desc, &taskDateVal, &end, &status, &priority, &idAcc, &cat, &scheduleId, &idCage, &startTime, &rincian, &idMating, &created, &updated)
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
		taskList = append(taskList, &task)
	}
	return taskList, nil
}
