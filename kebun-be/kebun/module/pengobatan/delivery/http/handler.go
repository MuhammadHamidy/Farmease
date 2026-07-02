package http

import (
	"github.com/farmease/farmease-be/farmease/module/pengobatan/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type PengobatanHandler struct {
	usecase domain.PengobatanUsecase
}

func NewPengobatanHandler(usecase domain.PengobatanUsecase) *PengobatanHandler {
	return &PengobatanHandler{usecase: usecase}
}

func (h *PengobatanHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/pengobatan")
	api.Get("/rekomendasi", h.GetRekomendasi)
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *PengobatanHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all medical treatment records", list)
}

func (h *PengobatanHandler) FindByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	p, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if p == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Medical treatment record not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get medical treatment record", p)
}

func (h *PengobatanHandler) Create(c *fiber.Ctx) error {
	var p domain.Pengobatan
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create medical treatment record", p)
}

func (h *PengobatanHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var p domain.Pengobatan
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	p.IDPengobatan = id
	if err := h.usecase.Update(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update medical treatment record", p)
}

func (h *PengobatanHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete medical treatment record", nil)
}

func (h *PengobatanHandler) GetRekomendasi(c *fiber.Ctx) error {
	varietas := c.Query("varietas")
	fase := c.Query("fase")
	obat := c.Query("obat")

	rekomendasi, err := h.usecase.GetRekomendasiObat(c.Context(), varietas, fase, obat)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}

	return apiresponses.Success(c, fiber.StatusOK, "Success get recommendation", fiber.Map{
		"rekomendasi": rekomendasi,
	})
}
