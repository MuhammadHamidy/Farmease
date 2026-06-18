package http

import (
	"github.com/farmease/farmease-be/farmease/module/pencatatan_types/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	usecase domain.Usecase
}

func NewHandler(usecase domain.Usecase) *Handler {
	return &Handler{usecase: usecase}
}

func (h *Handler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/pencatatan-types")
	api.Get("/catalog", h.GetCatalog)
	api.Get("/jenis/:nama/rincian", h.GetRincianByJenisNama)
	api.Post("/jenis", h.CreateJenis)
	api.Post("/rincian", h.CreateRincian)
}

func (h *Handler) GetCatalog(c *fiber.Ctx) error {
	catalog, err := h.usecase.GetCatalog(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get pencatatan catalog", catalog)
}

func (h *Handler) GetRincianByJenisNama(c *fiber.Ctx) error {
	nama := c.Params("nama")
	if nama == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid jenis name")
	}

	list, err := h.usecase.GetRincianByJenisNama(c.Context(), nama)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get rincian pencatatan", list)
}

func (h *Handler) CreateJenis(c *fiber.Ctx) error {
	var input domain.CreateJenisInput
	if err := c.BodyParser(&input); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}

	created, err := h.usecase.CreateJenis(c.Context(), input)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create jenis pencatatan", created)
}

func (h *Handler) CreateRincian(c *fiber.Ctx) error {
	var input domain.CreateRincianInput
	if err := c.BodyParser(&input); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}

	created, err := h.usecase.CreateRincian(c.Context(), input)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create rincian pencatatan", created)
}
