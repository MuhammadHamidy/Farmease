package http

import (
	"net/http"
	"time"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

func (h *TaskHandler) UpdateTask(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		TaskDate    time.Time `json:"task_date"`
		DueDate     time.Time `json:"due_date"` // fallback for FE
		Status      string    `json:"status"`
		Priority    string    `json:"priority"`
		IDAccount   string    `json:"id_account"`
		UserID      string    `json:"user_id"` // fallback for FE
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

	if appErr := validation.ValidateStruct(&taskItem); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.UpdateTask(c.Context(), id, &taskItem)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(taskItem)
}
