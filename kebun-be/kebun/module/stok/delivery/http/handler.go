package http

import (
	"strconv"

	"github.com/farmease/kebun-be/kebun/module/stok/domain"
	"github.com/farmease/kebun-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type StokHandler struct {
	usecase domain.StokUsecase
}

func NewStokHandler(usecase domain.StokUsecase) *StokHandler {
	return &StokHandler{usecase: usecase}
}

func (h *StokHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/stok")

	// Bahan Endpoints
	api.Get("/bahan", h.FindAllBahan)
	api.Post("/bahan", h.CreateBahan)
	api.Patch("/bahan/:id", h.UpdateBahanStock)

	// Pupuk Endpoints
	api.Get("/pupuk", h.FindAllPupuk)
	api.Post("/pupuk", h.CreatePupuk)
	api.Patch("/pupuk/:id", h.UpdatePupukStock)

	// Obat Endpoints
	api.Get("/obat", h.FindAllObat)
	api.Post("/obat", h.CreateObat)
	api.Patch("/obat/:id", h.UpdateObatStock)
}

// === BAHAN ===

func (h *StokHandler) FindAllBahan(c *fiber.Ctx) error {
	list, err := h.usecase.FindAllBahan(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all materials stock", list)
}

func (h *StokHandler) CreateBahan(c *fiber.Ctx) error {
	var s domain.StokBahan
	if err := c.BodyParser(&s); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.StoreBahan(c.Context(), &s); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create material stock", s)
}

func (h *StokHandler) UpdateBahanStock(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	amountStr := c.Query("amount")
	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid amount")
	}
	typeAction := c.Query("type", "tambah") // "tambah" or "kurang"

	if err := h.usecase.UpdateBahanStock(c.Context(), id, amount, typeAction); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update material stock", nil)
}

// === PUPUK ===

func (h *StokHandler) FindAllPupuk(c *fiber.Ctx) error {
	list, err := h.usecase.FindAllPupuk(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all fertilizers stock", list)
}

func (h *StokHandler) CreatePupuk(c *fiber.Ctx) error {
	var s domain.StokPupuk
	if err := c.BodyParser(&s); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.StorePupuk(c.Context(), &s); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create fertilizer stock", s)
}

func (h *StokHandler) UpdatePupukStock(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	amountStr := c.Query("amount")
	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid amount")
	}
	typeAction := c.Query("type", "tambah")

	if err := h.usecase.UpdatePupukStock(c.Context(), id, amount, typeAction); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update fertilizer stock", nil)
}

// === OBAT ===

func (h *StokHandler) FindAllObat(c *fiber.Ctx) error {
	list, err := h.usecase.FindAllObat(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all medicines stock", list)
}

func (h *StokHandler) CreateObat(c *fiber.Ctx) error {
	var s domain.StokObat
	if err := c.BodyParser(&s); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.StoreObat(c.Context(), &s); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create medicine stock", s)
}

func (h *StokHandler) UpdateObatStock(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	amountStr := c.Query("amount")
	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid amount")
	}
	typeAction := c.Query("type", "tambah")

	if err := h.usecase.UpdateObatStock(c.Context(), id, amount, typeAction); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update medicine stock", nil)
}

