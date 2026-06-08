package http

import (
	"net/http"
	"strconv"
	"time"

	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type TaskHandler struct {
	useCase domain.UseCase
}

func NewTaskHandler(useCase domain.UseCase) *TaskHandler {
	return &TaskHandler{useCase: useCase}
}

func (h *TaskHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	tasks := api.Group("/tasks")
	tasks.Get("/", h.GetMyTasks)
	tasks.Post("/", h.CreateTask)
	tasks.Put("/:id", h.UpdateTask)
	tasks.Patch("/:id/complete", h.CompleteTask)
	tasks.Delete("/:id", h.DeleteTask)
}

// GetMyTasks godoc
// @Summary      Get my tasks
// @Description  Retrieve tasks assigned to the authenticated user
// @Tags         tasks
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        date     query     string  false  "Filter by date (YYYY-MM-DD)"
// @Success      200      {array}   domain.Task
// @Failure      500      {object}  responses.Response[any]
// @Router       /api/tasks [get]
func (h *TaskHandler) GetMyTasks(c *fiber.Ctx) error {
	idAccount := 1 // Mock, should get from JWT
	dateStr := c.Query("date")
	var date *time.Time
	if dateStr != "" {
		parsedTime, _ := time.Parse("2006-01-02", dateStr)
		date = &parsedTime
	}

	res, err := h.useCase.GetMyTasks(c.Context(), idAccount, date)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// CreateTask godoc
// @Summary      Create task
// @Description  Create a new operational task
// @Tags         tasks
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.Task  true  "Task details"
// @Success      201     {object}  domain.Task
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/tasks [post]
func (h *TaskHandler) CreateTask(c *fiber.Ctx) error {
	var req struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		TaskDate    time.Time `json:"task_date"`
		DueDate     time.Time `json:"due_date"` // fallback for FE
		Status      string    `json:"status"`
		IDAccount   int       `json:"id_account"`
		UserID      int       `json:"user_id"` // fallback for FE
		Category    string    `json:"category"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	taskItem := domain.Task{
		Title:       req.Title,
		Description: req.Description,
		Status:      req.Status,
		Category:    req.Category,
	}

	if req.UserID != 0 {
		taskItem.IDAccount = req.UserID
	} else if req.IDAccount != 0 {
		taskItem.IDAccount = req.IDAccount
	} else {
		taskItem.IDAccount = 1 // Mock fallback
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

// CompleteTask godoc
// @Summary      Complete task
// @Description  Mark a task as completed
// @Tags         tasks
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Task ID"
// @Success      200  {object}  object
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/tasks/{id}/complete [patch]
func (h *TaskHandler) CompleteTask(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	err := h.useCase.CompleteTask(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}

func (h *TaskHandler) UpdateTask(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var req struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		TaskDate    time.Time `json:"task_date"`
		DueDate     time.Time `json:"due_date"` // fallback for FE
		Status      string    `json:"status"`
		IDAccount   int       `json:"id_account"`
		UserID      int       `json:"user_id"` // fallback for FE
		Category    string    `json:"category"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	taskItem := domain.Task{
		Title:       req.Title,
		Description: req.Description,
		Status:      req.Status,
		Category:    req.Category,
	}

	if req.UserID != 0 {
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
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(taskItem)
}

func (h *TaskHandler) DeleteTask(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	err := h.useCase.DeleteTask(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}
