package http

import (
	"net/http"
	"time"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

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

	if appErr := validation.ValidateStruct(rs); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.Update(c.Context(), rs)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	// Regenerate tasks ONLY for this updated schedule (not all schedules)
	_ = h.useCase.GenerateTasksForSchedule(c.Context(), rs.ID, 7)

	return c.Status(http.StatusOK).JSON(rs)
}
