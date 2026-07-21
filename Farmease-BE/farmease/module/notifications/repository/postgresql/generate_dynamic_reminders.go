package postgresql

import (
	"context"
	"fmt"
	"time"
)

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
		SELECT t.id_task, t.title, COALESCE(c.cage_code, 'A') as cage_code, t.start_time
		FROM operations.tasks t
		LEFT JOIN livestock.cages c ON t.id_cage = c.id_cage
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
			var taskItem taskInfo
			var startTimeRaw interface{}
			if scanErr := rows.Scan(&taskItem.ID, &taskItem.Title, &taskItem.CageCode, &startTimeRaw); scanErr == nil {
				if st, ok := startTimeRaw.(time.Time); ok {
					taskItem.StartTime = st.Format("15:04")
				} else if stStr, ok := startTimeRaw.(string); ok {
					taskItem.StartTime = stStr
				} else {
					taskItem.StartTime = "08:00"
				}
				tasks = append(tasks, taskItem)
			}
		}
		
		for _, task := range tasks {
			// Check if already notified
			var exists bool
			checkQuery := `SELECT EXISTS(SELECT 1 FROM operations.notifications WHERE id_account = $1 AND type = 'reminder' AND message LIKE '%' || $2 || '%')`
			_ = r.db.QueryRow(ctx, checkQuery, idAccount, task.ID).Scan(&exists)
			
			if !exists {
				msg := fmt.Sprintf("Pengingat H-1: Tugas '%s' di Kandang %s dijadwalkan untuk besok (%s) pukul %s. (Task ID: %s)", 
					task.Title, task.CageCode, tomorrow.Format("2006-01-02"), task.StartTime, task.ID)
				
				insertQuery := `INSERT INTO operations.notifications (title, message, is_read, id_account, type, task_id) VALUES ($1, $2, false, $3, 'reminder', $4)`
				_, _ = r.db.Exec(ctx, insertQuery, "Tugas Besok: "+task.Title, msg, idAccount, task.ID)
			}
		}
	}

	// 2. Today's Vitamin Reminders
	todayStart := time.Date(localNow.Year(), localNow.Month(), localNow.Day(), 0, 0, 0, 0, loc)
	todayEnd := time.Date(localNow.Year(), localNow.Month(), localNow.Day(), 23, 59, 59, 999999999, loc)

	vitaminQuery := `
		SELECT t.id_task, t.title, COALESCE(c.cage_code, 'A') as cage_code, t.start_time
		FROM operations.tasks t
		LEFT JOIN livestock.cages c ON t.id_cage = c.id_cage
		WHERE t.id_account = $1
		  AND t.task_date >= $2
		  AND t.task_date <= $3
		  AND t.status != 'selesai'
		  AND (LOWER(t.title) LIKE '%vitamin%' OR t.rincian = 'Pemberian Vitamin')`
	
	vRows, err := r.db.Query(ctx, vitaminQuery, idAccount, todayStart, todayEnd)
	if err == nil {
		defer vRows.Close()
		type taskInfo struct {
			ID        string
			Title     string
			CageCode  string
			StartTime string
		}
		var vTasks []taskInfo
		for vRows.Next() {
			var taskItem taskInfo
			var startTimeRaw interface{}
			if scanErr := vRows.Scan(&taskItem.ID, &taskItem.Title, &taskItem.CageCode, &startTimeRaw); scanErr == nil {
				if st, ok := startTimeRaw.(time.Time); ok {
					taskItem.StartTime = st.Format("15:04")
				} else if stStr, ok := startTimeRaw.(string); ok {
					taskItem.StartTime = stStr
				} else {
					taskItem.StartTime = "08:00"
				}
				vTasks = append(vTasks, taskItem)
			}
		}
		
		for _, task := range vTasks {
			var exists bool
			checkQuery := `SELECT EXISTS(SELECT 1 FROM operations.notifications WHERE id_account = $1 AND type = 'reminder' AND message LIKE '%' || $2 || '%')`
			_ = r.db.QueryRow(ctx, checkQuery, idAccount, task.ID).Scan(&exists)
			
			if !exists {
				msg := fmt.Sprintf("Pengingat jadwal rutin hari ini: Pemberian Vitamin di Kandang %s pukul %s. (Task ID: %s)", 
					task.CageCode, task.StartTime, task.ID)
				
				insertQuery := `INSERT INTO operations.notifications (title, message, is_read, id_account, type, task_id) VALUES ($1, $2, false, $3, 'reminder', $4)`
				_, _ = r.db.Exec(ctx, insertQuery, "Jadwal Rutin: Pemberian Vitamin", msg, idAccount, task.ID)
			}
		}
	}

	// 3. Today's Pregnant Sheep Giving Birth Reminders
	isAdminOrOperator := idAccount == "11111111-1111-1111-1111-111111111101" || idAccount == "11111111-1111-1111-1111-111111111106"
	if isAdminOrOperator {
		birthQuery := `
			SELECT p.id_pregnancy, s.sheep_code
			FROM breeding.pregnancies p
			JOIN breeding.matings m ON p.id_mating = m.id_mating
			JOIN livestock.sheep s ON m.id_sheep_female = s.id_sheep
			WHERE p.pregnancy_status = 'dikandung'
			  AND p.expected_birth_date <= $1::date`
		
		bRows, err := r.db.Query(ctx, birthQuery, localNow.Format("2006-01-02"))
		if err == nil {
			defer bRows.Close()
			type pregInfo struct {
				ID        string
				SheepCode string
			}
			var pregs []pregInfo
			for bRows.Next() {
				var pregItem pregInfo
				if scanErr := bRows.Scan(&pregItem.ID, &pregItem.SheepCode); scanErr == nil {
					pregs = append(pregs, pregItem)
				}
			}
			
			for _, preg := range pregs {
				var exists bool
				checkQuery := `SELECT EXISTS(SELECT 1 FROM operations.notifications WHERE id_account = $1 AND type = 'reminder' AND message LIKE '%' || $2 || '%')`
				_ = r.db.QueryRow(ctx, checkQuery, idAccount, preg.ID).Scan(&exists)
				
				if !exists {
					msg := fmt.Sprintf("Perkiraan lahir hari ini untuk domba betina %s. Segera siapkan kandang bersalin dan pantau kondisi induk secara berkala. (Pregnancy ID: %s)", 
						preg.SheepCode, preg.ID)
					
					insertQuery := `INSERT INTO operations.notifications (title, message, is_read, id_account, type) VALUES ($1, $2, false, $3, 'reminder')`
					_, _ = r.db.Exec(ctx, insertQuery, "Domba "+preg.SheepCode+" Mau Melahirkan", msg, idAccount)
				}
			}
		}
	}

	return nil
}
