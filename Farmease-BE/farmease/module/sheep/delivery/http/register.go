package http

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

// RegisterSheep godoc
// @Summary      Register a new sheep
// @Description  Create a new sheep entry with initial details
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      object  true  "Sheep details"
// @Success      201     {object}  domain.Sheep
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/sheep [post]
func (h *SheepHandler) RegisterSheep(c *fiber.Ctx) error {
	var req struct {
		SheepCode   string  `json:"sheep_code" validate:"required"`
		SheepName   string  `json:"sheep_name"`
		Gender      string  `json:"gender" validate:"required,oneof=jantan betina"`
		DateOfBirth string  `json:"date_of_birth" validate:"required"`
		Status      string  `json:"status" validate:"required"`
		Origin      string  `json:"origin" validate:"required"`
		IDCage      string  `json:"id_cage" validate:"required"`
		IDType      string  `json:"id_type" validate:"required"`
		UmurMethod  string  `json:"umur_method"`
		PoelLevel   string  `json:"poel_level"`
		Owner       string  `json:"owner"`
		IDFather    *string `json:"id_father"`
		IDMother    *string `json:"id_mother"`
		PhotoURL    string  `json:"photo_url"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	if appErr := validation.ValidateStruct(&req); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	// Parse date_of_birth from YYYY-MM-DD or RFC3339
	var dob time.Time
	var err error
	if strings.Contains(req.DateOfBirth, "T") {
		dob, err = time.Parse(time.RFC3339, req.DateOfBirth)
	} else {
		dob, err = time.Parse("2006-01-02", req.DateOfBirth)
	}
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", "format date_of_birth tidak valid, gunakan YYYY-MM-DD"))
	}

	statusVal := strings.ToLower(req.Status)
	if statusVal == "sehat" {
		statusVal = "aktif"
	} else if statusVal == "terjual" {
		statusVal = "dijual"
	}

	sheep := domain.Sheep{
		SheepCode:   req.SheepCode,
		SheepName:   req.SheepName,
		Gender:      req.Gender,
		DateOfBirth: &dob,
		Status:      statusVal,
		Origin:      req.Origin,
		IDCage:      req.IDCage,
		IDType:      req.IDType,
		UmurMethod:  req.UmurMethod,
		PoelLevel:   req.PoelLevel,
		Owner:       req.Owner,
		IDFather:    req.IDFather,
		IDMother:    req.IDMother,
		PhotoURL:    req.PhotoURL,
	}

	fmt.Printf("DEBUG: Parsed JSON: UmurMethod='%s', PoelLevel='%s'\n", sheep.UmurMethod, sheep.PoelLevel)

	err = h.useCase.RegisterSheep(c.Context(), &sheep)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(sheep)
}
