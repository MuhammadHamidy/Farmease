package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *BreedingHandler) GetMatingList(c *fiber.Ctx) error {
	status := c.Query("status")
	var inbreedingFlag *bool
	if fs := c.Query("inbreeding_flag"); fs != "" {
		val := fs == "true"
		inbreedingFlag = &val
	}

	res, err := h.useCase.GetMatingList(c.Context(), status, inbreedingFlag)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}
