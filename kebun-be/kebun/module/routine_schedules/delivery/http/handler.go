package http

import (
	"net/http"
	"strings"
	"time"

	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type RoutineScheduleHandler struct {
	useCase domain.RoutineScheduleUsecase
}

func NewRoutineScheduleHandler(useCase domain.RoutineScheduleUsecase) *RoutineScheduleHandler {
	return &RoutineScheduleHandler{useCase: useCase}
}

func (h *RoutineScheduleHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	schedules := api.Group("/routine-schedules")
	schedules.Get("/", h.FindAll)
	schedules.Get("/:id", h.FindByID)
	schedules.Post("/", h.Create)
	schedules.Put("/:id", h.Update)
	schedules.Delete("/:id", h.Delete)
	schedules.Post("/generate", h.Generate)
}

func (h *RoutineScheduleHandler) FindAll(c *fiber.Ctx) error {
	res, err := h.useCase.FindAll(c.Context())
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

func (h *RoutineScheduleHandler) FindByID(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.FindByID(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	if res == nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", "routine schedule not found"))
	}
	return c.Status(http.StatusOK).JSON(res)
}

func (h *RoutineScheduleHandler) Create(c *fiber.Ctx) error {
	var req struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		Category     string    `json:"category"`
		Frequency    string    `json:"frequency"`
		DaysOfWeek   []int32   `json:"days_of_week"`
		DayOfMonth   *int32    `json:"day_of_month"`
		StartDate    time.Time `json:"start_date"`
		EndDate      *time.Time `json:"end_date"`
		StartTime    string    `json:"start_time"`
		EndTime      string    `json:"end_time"`
		Priority     string    `json:"priority"`
		IDCage       *string   `json:"id_cage"`
		IDAccount    *string   `json:"id_account"`
		Rincian      string    `json:"rincian"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	if req.StartDate.IsZero() {
		req.StartDate = time.Now()
	}

	rs := &domain.RoutineSchedule{
		Title:        req.Title,
		Description:  req.Description,
		Category:     req.Category,
		Frequency:    req.Frequency,
		DaysOfWeek:   req.DaysOfWeek,
		DayOfMonth:   req.DayOfMonth,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		StartTime:    req.StartTime,
		EndTime:      req.EndTime,
		Priority:     req.Priority,
		IDCage:       req.IDCage,
		IDAccount:    req.IDAccount,
		Rincian:      req.Rincian,
	}

	err := h.useCase.Create(c.Context(), rs)
	if err != nil {
		if strings.Contains(err.Error(), "sudah ada") {
			return c.Status(http.StatusConflict).JSON(responses.Fail("DUPLICATE_SCHEDULE", err.Error()))
		}
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	_ = h.useCase.GenerateTasksForSchedule(c.Context(), rs.ID, 7)

	return c.Status(http.StatusCreated).JSON(rs)
}

func (h *RoutineScheduleHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Title        string     `json:"title"`
		Description  string     `json:"description"`
		Category     string     `json:"category"`
		Frequency    string     `json:"frequency"`
		DaysOfWeek   []int32    `json:"days_of_week"`
		DayOfMonth   *int32     `json:"day_of_month"`
		StartDate    time.Time  `json:"start_date"`
		EndDate      *time.Time `json:"end_date"`
		StartTime    string     `json:"start_time"`
		EndTime      string     `json:"end_time"`
		Priority     string     `json:"priority"`
		IDCage       *string    `json:"id_cage"`
		IDAccount    *string    `json:"id_account"`
		Rincian      string     `json:"rincian"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	rs := &domain.RoutineSchedule{
		ID:           id,
		Title:        req.Title,
		Description:  req.Description,
		Category:     req.Category,
		Frequency:    req.Frequency,
		DaysOfWeek:   req.DaysOfWeek,
		DayOfMonth:   req.DayOfMonth,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		StartTime:    req.StartTime,
		EndTime:      req.EndTime,
		Priority:     req.Priority,
		IDCage:       req.IDCage,
		IDAccount:    req.IDAccount,
		Rincian:      req.Rincian,
	}

	err := h.useCase.Update(c.Context(), rs)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	_ = h.useCase.GenerateTasksForSchedule(c.Context(), rs.ID, 7)

	return c.Status(http.StatusOK).JSON(rs)
}

func (h *RoutineScheduleHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	err := h.useCase.Delete(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}

func (h *RoutineScheduleHandler) Generate(c *fiber.Ctx) error {
	var req struct {
		WindowDays int `json:"window_days"`
	}
	_ = c.BodyParser(&req)
	if req.WindowDays <= 0 {
		req.WindowDays = 7
	}

	err := h.useCase.GenerateTasks(c.Context(), req.WindowDays)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success", "message": "Tasks generated successfully"})
}
