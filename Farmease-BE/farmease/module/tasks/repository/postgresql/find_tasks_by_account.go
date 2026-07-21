package postgresql

import (
	"context"
	"time"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

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

	var list []*domain.Task
	for rows.Next() {
		var t domain.Task
		var desc, end, cat, status, priority *string
		var taskDate, created, updated *time.Time
		var idAcc, scheduleId, idCage, startTime, rincian, idMating *string
		err := rows.Scan(&t.IDTask, &t.Title, &desc, &taskDate, &end, &status, &priority, &idAcc, &cat, &scheduleId, &idCage, &startTime, &rincian, &idMating, &created, &updated)
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
		list = append(list, &t)
	}
	return list, nil
}
