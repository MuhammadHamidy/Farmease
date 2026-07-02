package http

import (
	"net/http"
	"time"
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

func (h *WeightHandler) RecordWeight(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		WeightKg     float64   `json:"weight_kg"`
		Weight       float64   `json:"weight"` // fallback for FE
		WeighingDate time.Time `json:"weighing_date"`
		DateRecorded time.Time `json:"date_recorded"` // fallback for FE
		Notes        string    `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	weightData := domain.Weight{
		IDSheep: id,
		Notes:   req.Notes,
	}

	if req.WeightKg != 0 {
		weightData.WeightKg = req.WeightKg
	} else {
		weightData.WeightKg = req.Weight
	}

	if !req.WeighingDate.IsZero() {
		weightData.WeighingDate = req.WeighingDate
	} else if !req.DateRecorded.IsZero() {
		weightData.WeighingDate = req.DateRecorded
	} else {
		weightData.WeighingDate = time.Now()
	}

	if appErr := validation.ValidateStruct(&weightData); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.RecordWeight(c.Context(), &weightData)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(weightData)
}
