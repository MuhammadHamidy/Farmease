package http

import (
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/pengingat_jadwal/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type PengingatJadwalHandler struct {
	usecase domain.PengingatJadwalUsecase
}

func NewPengingatJadwalHandler(usecase domain.PengingatJadwalUsecase) *PengingatJadwalHandler {
	return &PengingatJadwalHandler{usecase: usecase}
}

func (h *PengingatJadwalHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/pengingat-jadwal")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *PengingatJadwalHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all schedule reminders", list)
}

func (h *PengingatJadwalHandler) FindByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	pj, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if pj == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Schedule reminder not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get schedule reminder", pj)
}

func (h *PengingatJadwalHandler) Create(c *fiber.Ctx) error {
	var pj domain.PengingatJadwal
	if err := c.BodyParser(&pj); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &pj); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create schedule reminder", pj)
}

func (h *PengingatJadwalHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var pj domain.PengingatJadwal
	if err := c.BodyParser(&pj); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	pj.IDPengingatJadwal = id
	if err := h.usecase.Update(c.Context(), &pj); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update schedule reminder", pj)
}

func (h *PengingatJadwalHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete schedule reminder", nil)
}

