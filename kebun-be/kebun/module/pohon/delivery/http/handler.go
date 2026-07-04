package http

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/farmease/kebun-be/kebun/module/pohon/domain"
	"github.com/farmease/kebun-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PohonHandler struct {
	usecase domain.PohonUsecase
	db      *pgxpool.Pool
}

func NewPohonHandler(usecase domain.PohonUsecase, db *pgxpool.Pool) *PohonHandler {
	return &PohonHandler{usecase: usecase, db: db}
}

func (h *PohonHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/pohon")
	api.Get("/sync", h.SyncDatabase) // MUST be before /:id
	api.Get("/sync-error", h.SyncError)
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *PohonHandler) SyncDatabase(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Terminate other active sessions to prevent lock contention
	_, _ = h.db.Exec(ctx, `
		SELECT pg_terminate_backend(pid)
		FROM pg_stat_activity
		WHERE datname = current_database() AND pid <> pg_backend_pid();
	`)

	_, err := h.db.Exec(ctx, "DROP SCHEMA IF EXISTS gardening CASCADE; CREATE SCHEMA gardening;")
	if err != nil {
		return c.Status(500).SendString("Error dropping schema: " + err.Error())
	}

	dir := "migrations"
	files, err := os.ReadDir(dir)
	if err != nil {
		return c.Status(500).SendString("Error reading migrations dir: " + err.Error())
	}
	var upFiles []string
	for _, f := range files {
		if !f.IsDir() && strings.HasSuffix(f.Name(), ".up.sql") {
			upFiles = append(upFiles, f.Name())
		}
	}
	sort.Strings(upFiles)
	var logLines []string
	logLines = append(logLines, "Schema reset success.")
	for _, fname := range upFiles {
		fpath := filepath.Join(dir, fname)
		content, err := os.ReadFile(fpath)
		if err != nil {
			return c.Status(500).SendString("Error reading file " + fname + ": " + err.Error())
		}
		sqlStr := string(content)
		// Skip only if there are no actual SQL statements (only comments/whitespace)
		trimmed := strings.TrimSpace(sqlStr)
		if trimmed == "" {
			logLines = append(logLines, fname+" skipped (empty)")
			continue
		}
		// Check if ALL non-empty lines are comments
		lines := strings.Split(trimmed, "\n")
		hasSQL := false
		for _, line := range lines {
			l := strings.TrimSpace(line)
			if l != "" && !strings.HasPrefix(l, "--") {
				hasSQL = true
				break
			}
		}
		if !hasSQL {
			logLines = append(logLines, fname+" skipped (comments only)")
			continue
		}
		_, err = h.db.Exec(ctx, sqlStr)
		if err != nil {
			return c.Status(500).SendString("Error running migration " + fname + ": " + err.Error())
		}
		logLines = append(logLines, fname+" executed successfully.")
	}
	seedFile := "seeders/gardening_seeds.sql"
	seedContent, err := os.ReadFile(seedFile)
	if err != nil {
		return c.Status(500).SendString("Error reading seed file: " + err.Error())
	}
	_, err = h.db.Exec(ctx, string(seedContent))
	if err != nil {
		return c.Status(500).SendString("Error running seeds: " + err.Error())
	}
	logLines = append(logLines, "Seeds executed successfully.")
	
	// Diagnostic Query
	var debugMsg string
	rows, err := h.db.Query(ctx, `SELECT id, type, type_label, operator_code, operator_name, cage_code, scope, summary, payload, submitted_at, approval_status, reviewed_at, reviewed_by, review_note, task_id, created_at, updated_at FROM gardening.pencatatan_submissions`)
	if err != nil {
		debugMsg = "Query error: " + err.Error()
	} else {
		defer rows.Close()
		count := 0
		for rows.Next() {
			count++
			var id, typ, type_label, operator_code, operator_name, cage_code, scope, summary, approval_status string
			var payloadBytes []byte
			var submitted_at, created_at, updated_at time.Time
			var reviewed_at *time.Time
			var reviewed_by, review_note, task_id *string
			
			scanErr := rows.Scan(
				&id, &typ, &type_label, &operator_code, &operator_name,
				&cage_code, &scope, &summary, &payloadBytes, &submitted_at,
				&approval_status, &reviewed_at, &reviewed_by, &review_note,
				&task_id, &created_at, &updated_at,
			)
			if scanErr != nil {
				debugMsg += fmt.Sprintf("Row %d scan error: %s\n", count, scanErr.Error())
			} else {
				taskVal := "nil"
				if task_id != nil {
					taskVal = *task_id
				}
				debugMsg += fmt.Sprintf("Row %d: id=%s, type=%s, task_id=%s\n", count, id, typ, taskVal)
			}
		}
		if debugMsg == "" {
			debugMsg = fmt.Sprintf("Success, scanned %d rows without error.", count)
		}
	}
	_ = os.WriteFile("submissions_debug.txt", []byte(debugMsg), 0644)
	
	return c.JSON(logLines)
}

func (h *PohonHandler) FindAll(c *fiber.Ctx) error {
	trees, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all trees", trees)
}

func (h *PohonHandler) FindByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	p, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if p == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Tree not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get tree", p)
}

func (h *PohonHandler) Create(c *fiber.Ctx) error {
	var p domain.Pohon
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create tree", p)
}

func (h *PohonHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var p domain.Pohon
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	p.IDPohon = id
	if err := h.usecase.Update(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update tree", p)
}

func (h *PohonHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete tree", nil)
}

func (h *PohonHandler) SyncError(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// 1. Drop and recreate gardening schema
	_, err := h.db.Exec(ctx, "DROP SCHEMA IF EXISTS gardening CASCADE; CREATE SCHEMA gardening;")
	if err != nil {
		return c.Status(200).JSON(fiber.Map{"error": "drop_schema: " + err.Error()})
	}

	// 2. Read migrations
	dir := "migrations"
	files, err := os.ReadDir(dir)
	if err != nil {
		return c.Status(200).JSON(fiber.Map{"error": "read_migrations: " + err.Error()})
	}
	var upFiles []string
	for _, f := range files {
		if !f.IsDir() && strings.HasSuffix(f.Name(), ".up.sql") {
			upFiles = append(upFiles, f.Name())
		}
	}
	sort.Strings(upFiles)

	// 3. Run migrations
	for _, fname := range upFiles {
		fpath := filepath.Join(dir, fname)
		content, err := os.ReadFile(fpath)
		if err != nil {
			return c.Status(200).JSON(fiber.Map{"error": "read_file_" + fname + ": " + err.Error()})
		}
		_, err = h.db.Exec(ctx, string(content))
		if err != nil {
			return c.Status(200).JSON(fiber.Map{"error": "migration_" + fname + ": " + err.Error()})
		}
	}

	// 4. Seed database
	seedContent, err := os.ReadFile("seeders/gardening_seeds.sql")
	if err != nil {
		return c.Status(200).JSON(fiber.Map{"error": "read_seeder: " + err.Error()})
	}
	_, err = h.db.Exec(ctx, string(seedContent))
	if err != nil {
		return c.Status(200).JSON(fiber.Map{"error": "run_seeder: " + err.Error()})
	}

	return c.Status(200).JSON(fiber.Map{"status": "success"})
}

