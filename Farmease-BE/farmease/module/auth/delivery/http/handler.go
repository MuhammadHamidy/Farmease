package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/auth/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	useCase domain.UseCase
}

func NewAuthHandler(useCase domain.UseCase) *AuthHandler {
	return &AuthHandler{useCase: useCase}
}

func (h *AuthHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	auth := api.Group("/auth")
	auth.Post("/login", h.Login)
	auth.Post("/login-operator", h.LoginOperator)

	accounts := api.Group("/accounts")
	accounts.Get("/", h.GetAccountList)
	accounts.Post("/", h.CreateAccount)

	roles := api.Group("/roles")
	roles.Get("/", h.GetRoleList)
}

// Login godoc
// @Summary      Login and get JWT token
// @Description  Authenticate user with username and password
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body      domain.LoginRequest  true  "Login credentials"
// @Success      200     {object}  domain.LoginResponse
// @Failure      401     {object}  responses.Response[any]
// @Router       /api/auth/login [post]
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req domain.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	res, err := h.useCase.Login(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(responses.Fail("UNAUTHORIZED", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}

// LoginOperator godoc
// @Summary      Login as Operator without password
// @Description  Authenticate operator with only operator_id (username)
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body      object  true  "Login credentials"
// @Success      200     {object}  domain.LoginResponse
// @Failure      401     {object}  responses.Response[any]
// @Router       /api/auth/login-operator [post]
func (h *AuthHandler) LoginOperator(c *fiber.Ctx) error {
	var req struct {
		OperatorID string `json:"operator_id"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	res, err := h.useCase.LoginOperator(c.Context(), req.OperatorID)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(responses.Fail("UNAUTHORIZED", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}

// GetAccountList godoc
// @Summary      Get list of all accounts
// @Description  Retrieve all accounts with their roles
// @Tags         accounts
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200     {array}   domain.Account
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/accounts [get]
func (h *AuthHandler) GetAccountList(c *fiber.Ctx) error {
	res, err := h.useCase.GetAccountList(c.Context())
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// CreateAccount godoc
// @Summary      Create a new account
// @Description  Register a new account with role and operator category
// @Tags         accounts
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.Account  true  "Account details"
// @Success      201     {object}  domain.Account
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/accounts [post]
func (h *AuthHandler) CreateAccount(c *fiber.Ctx) error {
	var account domain.Account
	if err := c.BodyParser(&account); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.CreateAccount(c.Context(), &account)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(account)
}

// GetRoleList godoc
// @Summary      Get list of all roles
// @Description  Retrieve all available roles in the system
// @Tags         roles
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200     {array}   domain.Role
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/roles [get]
func (h *AuthHandler) GetRoleList(c *fiber.Ctx) error {
	res, err := h.useCase.GetRoleList(c.Context())
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
