package http

import (
	"net/http"
	"strings"
	"time"

	"github.com/farmease/kebun-be/kebun/module/tasks/domain"
	"github.com/farmease/kebun-be/libraries/middleware"
	"github.com/farmease/kebun-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type TaskHandler struct {
	useCase domain.UseCase
	auth    *middleware.AuthorizationMiddleware
}

func NewTaskHandler(useCase domain.UseCase, auth *middleware.AuthorizationMiddleware) *TaskHandler {
	return &TaskHandler{
		useCase: useCase,
		auth:    auth,
	}
}

func extractAccountID(c *fiber.Ctx) string {
	if userIdVal := c.Locals("X-User-Id"); userIdVal != nil {
		if userIdStr, ok := userIdVal.(string); ok && userIdStr != "" && userIdStr != "dev-user" {
			return userIdStr
		}
	}

	authHeader := c.Get("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
			tokenStr := parts[1]
			claims := jwt.MapClaims{}
			_, _, err := new(jwt.Parser).ParseUnverified(tokenStr, &claims)
			if err == nil {
				if idAccount, ok := claims["id_account"].(string); ok && idAccount != "" {
					return idAccount
				}
			}
		}
	}

	return "11111111-1111-1111-1111-111111111101"
}

func (h *TaskHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	tasks := api.Group("/tasks", h.auth.Authenticate())
	tasks.Get("/", h.GetMyTasks)
	tasks.Post("/", h.CreateTask)
	tasks.Put("/:id", h.UpdateTask)
	tasks.Patch("/:id/complete", h.CompleteTask)
	tasks.Delete("/:id", h.DeleteTask)
}

func (h *TaskHandler) GetMyTasks(c *fiber.Ctx) error {
	idAccount := extractAccountID(c)
	var roleName string
	if roleVal := c.Locals("X-Role-Name"); roleVal != nil {
		if roleStr, ok := roleVal.(string); ok {
			roleName = roleStr
		}
	}
	if roleName == "" {
		authHeader := c.Get("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
				tokenStr := parts[1]
				claims := jwt.MapClaims{}
				_, _, err := new(jwt.Parser).ParseUnverified(tokenStr, &claims)
				if err == nil {
					if roleStr, ok := claims["role_name"].(string); ok && roleStr != "" {
						roleName = roleStr
					}
				}
			}
		}
	}

	if roleName == "" && idAccount == "11111111-1111-1111-1111-111111111101" {
		roleName = "Admin"
	}

	dateStr := c.Query("date")
	var date *time.Time
	if dateStr != "" {
		parsedTime, _ := time.Parse("2006-01-02", dateStr)
		date = &parsedTime
	}

	res, err := h.useCase.GetMyTasks(c.Context(), idAccount, roleName, date)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

func (h *TaskHandler) CreateTask(c *fiber.Ctx) error {
	var req struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		TaskDate    time.Time `json:"task_date"`
		DueDate     time.Time `json:"due_date"`
		Status      string    `json:"status"`
		Priority    string    `json:"priority"`
		IDAccount   string    `json:"id_account"`
		UserID      string    `json:"user_id"`
		Category    string    `json:"category"`
		EndTime     string    `json:"end_time"`
		ScheduleID  *string   `json:"schedule_id"`
		IDCage      *string   `json:"id_cage"`
		StartTime   string    `json:"start_time"`
		Rincian     string    `json:"rincian"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	taskItem := domain.Task{
		Title:       req.Title,
		Description: req.Description,
		Status:      req.Status,
		Priority:    req.Priority,
		Category:    req.Category,
		EndTime:     req.EndTime,
		ScheduleID:  req.ScheduleID,
		IDCage:      req.IDCage,
		StartTime:   req.StartTime,
		Rincian:     req.Rincian,
	}

	if req.UserID != "" {
		taskItem.IDAccount = req.UserID
	} else if req.IDAccount != "" {
		taskItem.IDAccount = req.IDAccount
	} else {
		taskItem.IDAccount = extractAccountID(c)
	}

	if !req.TaskDate.IsZero() {
		taskItem.TaskDate = req.TaskDate
	} else if !req.DueDate.IsZero() {
		taskItem.TaskDate = req.DueDate
	} else {
		taskItem.TaskDate = time.Now()
	}

	err := h.useCase.CreateTask(c.Context(), &taskItem)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(taskItem)
}

func (h *TaskHandler) CompleteTask(c *fiber.Ctx) error {
	id := c.Params("id")
	err := h.useCase.CompleteTask(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}

func (h *TaskHandler) UpdateTask(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		TaskDate    time.Time `json:"task_date"`
		DueDate     time.Time `json:"due_date"`
		Status      string    `json:"status"`
		Priority    string    `json:"priority"`
		IDAccount   string    `json:"id_account"`
		UserID      string    `json:"user_id"`
		Category    string    `json:"category"`
		EndTime     string    `json:"end_time"`
		ScheduleID  *string   `json:"schedule_id"`
		IDCage      *string   `json:"id_cage"`
		StartTime   string    `json:"start_time"`
		Rincian     string    `json:"rincian"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	taskItem := domain.Task{
		IDTask:      id,
		Title:       req.Title,
		Description: req.Description,
		Status:      req.Status,
		Priority:    req.Priority,
		Category:    req.Category,
		EndTime:     req.EndTime,
		ScheduleID:  req.ScheduleID,
		IDCage:      req.IDCage,
		StartTime:   req.StartTime,
		Rincian:     req.Rincian,
	}

	if req.UserID != "" {
		taskItem.IDAccount = req.UserID
	} else {
		taskItem.IDAccount = req.IDAccount
	}

	if !req.TaskDate.IsZero() {
		taskItem.TaskDate = req.TaskDate
	} else if !req.DueDate.IsZero() {
		taskItem.TaskDate = req.DueDate
	}

	err := h.useCase.UpdateTask(c.Context(), id, &taskItem)
	if err != nil {
		if err.Error() == "task not found" {
			return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", err.Error()))
		}
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(taskItem)
}

func (h *TaskHandler) DeleteTask(c *fiber.Ctx) error {
	id := c.Params("id")
	err := h.useCase.DeleteTask(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}

