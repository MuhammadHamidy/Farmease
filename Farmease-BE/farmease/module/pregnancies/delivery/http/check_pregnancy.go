package http

import (
	"net/http"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
	responses "github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *PregnancyHandler) CheckPregnancy(c *fiber.Ctx) error {
	var req domain.PregnancyCheckRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.CheckPregnancy(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	msg := "Pemeriksaan kehamilan berhasil diproses."
	if req.Hasil == "bunting_terkonfirmasi" {
		msg = "Kehamilan berhasil dikonfirmasi. Jadwal perkiraan kelahiran telah otomatis dibuat."
	} else if req.Hasil == "tidak_bunting" {
		msg = "Hasil pemeriksaan negatif. Status reproduksi domba betina dikembalikan menjadi aktif."
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message":   msg,
		"id_mating": req.IDMating,
		"hasil":     req.Hasil,
	})
}
