package postgresql

import (
	"context"
	"fmt"
	"time"

	"github.com/farmease/farmease-be/farmease/module/notifications/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindNotificationsByAccount(ctx context.Context, idAccount string) ([]*domain.Notification, error) {
	query := `SELECT id_notification, title, message, is_read, id_account, type, task_id, submission_id, created_at FROM gardening.notifications WHERE id_account = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, idAccount)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Notification
	for rows.Next() {
		var n domain.Notification
		err := rows.Scan(&n.IDNotification, &n.Title, &n.Message, &n.IsRead, &n.IDAccount, &n.Type, &n.TaskID, &n.SubmissionID, &n.CreatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, &n)
	}
	return list, nil
}

func (r *Repository) StoreNotification(ctx context.Context, n *domain.Notification) error {
	query := `INSERT INTO gardening.notifications (title, message, is_read, id_account, type, task_id, submission_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_notification`
	return r.db.QueryRow(ctx, query, n.Title, n.Message, n.IsRead, n.IDAccount, n.Type, n.TaskID, n.SubmissionID).Scan(&n.IDNotification)
}

func (r *Repository) MarkNotificationRead(ctx context.Context, id string) error {
	query := `UPDATE gardening.notifications SET is_read = true WHERE id_notification = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *Repository) GenerateDynamicReminders(ctx context.Context, idAccount string, now time.Time) error {
	loc, _ := time.LoadLocation("Asia/Jakarta")
	if loc == nil {
		loc = time.UTC
	}
	localNow := now.In(loc)

	// 1. Tomorrow's Tasks Reminders (H-1)
	tomorrow := localNow.AddDate(0, 0, 1)
	tomorrowStart := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 0, 0, 0, 0, loc)
	tomorrowEnd := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 23, 59, 59, 999999999, loc)

	tomorrowQuery := `
		SELECT t.id_task, t.title, COALESCE(l.kode_lahan, 'L001') as kode_lahan, t.start_time
		FROM gardening.tasks t
		LEFT JOIN gardening.lahan l ON t.id_cage = l.id_lahan
		WHERE t.id_account = $1
		  AND t.task_date >= $2
		  AND t.task_date <= $3
		  AND t.status != 'selesai'`
	
	rows, err := r.db.Query(ctx, tomorrowQuery, idAccount, tomorrowStart, tomorrowEnd)
	if err == nil {
		defer rows.Close()
		type taskInfo struct {
			ID        string
			Title     string
			CageCode  string
			StartTime string
		}
		var tasks []taskInfo
		for rows.Next() {
			var t taskInfo
			var startTimeRaw interface{}
			if scanErr := rows.Scan(&t.ID, &t.Title, &t.CageCode, &startTimeRaw); scanErr == nil {
				if st, ok := startTimeRaw.(time.Time); ok {
					t.StartTime = st.Format("15:04")
				} else if stStr, ok := startTimeRaw.(string); ok {
					t.StartTime = stStr
				} else {
					t.StartTime = "08:00"
				}
				tasks = append(tasks, t)
			}
		}
		
		for _, task := range tasks {
			var exists bool
			checkQuery := `SELECT EXISTS(SELECT 1 FROM gardening.notifications WHERE id_account = $1 AND type = 'reminder' AND message LIKE '%' || $2 || '%')`
			_ = r.db.QueryRow(ctx, checkQuery, idAccount, task.ID).Scan(&exists)
			
			if !exists {
				msg := fmt.Sprintf("Pengingat H-1: Tugas '%s' di Lahan %s dijadwalkan untuk besok (%s) pukul %s. (Task ID: %s)", 
					task.Title, task.CageCode, tomorrow.Format("2006-01-02"), task.StartTime, task.ID)
				
				insertQuery := `INSERT INTO gardening.notifications (title, message, is_read, id_account, type, task_id) VALUES ($1, $2, false, $3, 'reminder', $4)`
				_, _ = r.db.Exec(ctx, insertQuery, "Tugas Besok: "+task.Title, msg, idAccount, task.ID)
			}
		}
	}

	// 2. Today's Panen/Pemupukan Reminders
	todayStart := time.Date(localNow.Year(), localNow.Month(), localNow.Day(), 0, 0, 0, 0, loc)
	todayEnd := time.Date(localNow.Year(), localNow.Month(), localNow.Day(), 23, 59, 59, 999999999, loc)

	gardeningQuery := `
		SELECT t.id_task, t.title, COALESCE(l.kode_lahan, 'L001') as kode_lahan, t.start_time, t.category
		FROM gardening.tasks t
		LEFT JOIN gardening.lahan l ON t.id_cage = l.id_lahan
		WHERE t.id_account = $1
		  AND t.task_date >= $2
		  AND t.task_date <= $3
		  AND t.status != 'selesai'
		  AND (LOWER(t.title) LIKE '%panen%' OR LOWER(t.title) LIKE '%pupuk%' OR t.category IN ('panen', 'pemupukan'))`
	
	gRows, err := r.db.Query(ctx, gardeningQuery, idAccount, todayStart, todayEnd)
	if err == nil {
		defer gRows.Close()
		type taskInfo struct {
			ID        string
			Title     string
			CageCode  string
			StartTime string
			Category  string
		}
		var gTasks []taskInfo
		for gRows.Next() {
			var t taskInfo
			var startTimeRaw interface{}
			if scanErr := gRows.Scan(&t.ID, &t.Title, &t.CageCode, &startTimeRaw, &t.Category); scanErr == nil {
				if st, ok := startTimeRaw.(time.Time); ok {
					t.StartTime = st.Format("15:04")
				} else if stStr, ok := startTimeRaw.(string); ok {
					t.StartTime = stStr
				} else {
					t.StartTime = "08:00"
				}
				gTasks = append(gTasks, t)
			}
		}
		
		for _, task := range gTasks {
			var exists bool
			checkQuery := `SELECT EXISTS(SELECT 1 FROM gardening.notifications WHERE id_account = $1 AND type = 'reminder' AND message LIKE '%' || $2 || '%')`
			_ = r.db.QueryRow(ctx, checkQuery, idAccount, task.ID).Scan(&exists)
			
			if !exists {
				msg := fmt.Sprintf("Pengingat jadwal rutin hari ini: %s di Lahan %s pukul %s. (Task ID: %s)", 
					task.Title, task.CageCode, task.StartTime, task.ID)
				
				insertQuery := `INSERT INTO gardening.notifications (title, message, is_read, id_account, type, task_id) VALUES ($1, $2, false, $3, 'reminder', $4)`
				_, _ = r.db.Exec(ctx, insertQuery, "Jadwal Rutin: "+task.Title, msg, idAccount, task.ID)
			}
		}
	}

	return nil
}
