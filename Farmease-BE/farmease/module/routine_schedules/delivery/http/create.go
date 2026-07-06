package http

import (
	"net/http"
	"strings"
	"time"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

// Create godoc
// @Summary      Create a routine schedule
// @Description  Create a new routine schedule and generate tasks for it
// @Tags         routine-schedules
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.RoutineSchedule  true  "Routine Schedule details"
// @Success      201     {object}  domain.RoutineSchedule
// @Failure      400     {object}  responses.Response[any]
// @Failure      409     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/routine-schedules [post]
func (h *RoutineScheduleHandler) Create(c *fiber.Ctx) error {
	var req struct {
		Title        string    `json:"title"`
		Description  string    `json:"description"`
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

	if appErr := validation.ValidateStruct(rs); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.Create(c.Context(), rs)
	if err != nil {
		// Return 409 Conflict for duplicate schedule, 500 for other errors
		if strings.Contains(err.Error(), "sudah ada") {
			return c.Status(http.StatusConflict).JSON(responses.Fail("DUPLICATE_SCHEDULE", err.Error()))
		}
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	// Generate tasks ONLY for this new schedule (not all schedules)
	_ = h.useCase.GenerateTasksForSchedule(c.Context(), rs.ID, 7)

	return c.Status(http.StatusCreated).JSON(rs)
}
