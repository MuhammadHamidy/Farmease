package http

import (
	"net/http"
	"strings"

	"github.com/farmease/sso-be/sso/module/auth/domain"
	"github.com/farmease/sso-be/libraries/responses"
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
	auth.Get("/introspect", h.Introspect)

	accounts := api.Group("/accounts")
	accounts.Get("/", h.GetAccountList)
	accounts.Post("/", h.CreateAccount)

	roles := api.Group("/roles")
	roles.Get("/", h.GetRoleList)

	api.Get("/metadata/enums", h.GetMetadataEnums)
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

type EnumChoice struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

type MetadataEnumsResponse struct {
	Gender             []EnumChoice `json:"gender"`
	SheepStatus        []EnumChoice `json:"sheep_status"`
	FeedCategory       []EnumChoice `json:"feed_category"`
	TaskCategory       []EnumChoice `json:"task_category"`
	TaskRincian        []EnumChoice `json:"task_rincian"`
	DayOfWeek          []EnumChoice `json:"day_of_week"`
	Frequency          []EnumChoice `json:"frequency"`
	MatingMethod       []EnumChoice `json:"mating_method"`
	MatingStatus       []EnumChoice `json:"mating_status"`
	PregnancyStatus    []EnumChoice `json:"pregnancy_status"`
	OffspringGender    []EnumChoice `json:"offspring_gender"`
	OffspringCondition []EnumChoice `json:"offspring_condition"`
	ManureActivity     []EnumChoice `json:"manure_activity"`
	ManureDest         []EnumChoice `json:"manure_dest"`
	Priority           []EnumChoice `json:"priority"`
	TaskStatus         []EnumChoice `json:"task_status"`
	HealthActions      []EnumChoice `json:"health_actions"`
	Medicines          []EnumChoice `json:"medicines"`
	ManureConditions   []EnumChoice `json:"manure_conditions"`
	PregnancyCheckMethods []EnumChoice `json:"pregnancy_check_methods"`
	PregnancyCheckResults []EnumChoice `json:"pregnancy_check_results"`
	EstrusCheckResults []EnumChoice `json:"estrus_check_results"`
	DamConditions      []EnumChoice `json:"dam_conditions"`
}

// GetMetadataEnums godoc
// @Summary      Get list of all system static enums
// @Description  Retrieve value-label choices for form fields to prevent free text entry
// @Tags         metadata
// @Accept       json
// @Produce      json
// @Success      200     {object}  MetadataEnumsResponse
// @Router       /api/metadata/enums [get]
func (h *AuthHandler) GetMetadataEnums(c *fiber.Ctx) error {
	response := MetadataEnumsResponse{
		Gender: []EnumChoice{
			{Value: "jantan", Label: "Jantan"},
			{Value: "betina", Label: "Betina"},
		},
		SheepStatus: []EnumChoice{
			{Value: "aktif", Label: "Aktif"},
			{Value: "hamil", Label: "Hamil"},
			{Value: "dijual", Label: "Dijual"},
			{Value: "mati", Label: "Mati"},
			{Value: "disembelih", Label: "Disembelih"},
		},
		FeedCategory: []EnumChoice{
			{Value: "hijauan", Label: "Hijauan"},
			{Value: "konsentrat", Label: "Konsentrat"},
			{Value: "pellet", Label: "Pellet"},
			{Value: "greenery", Label: "Greenery"},
			{Value: "vitamin", Label: "Vitamin"},
		},
		TaskCategory: []EnumChoice{
			{Value: "pakan", Label: "Pemberian Pakan"},
			{Value: "kesehatan", Label: "Kesehatan / Pengobatan"},
			{Value: "kotoran", Label: "Kotoran / Sanitasi"},
			{Value: "perkawinan", Label: "Perkawinan"},
			{Value: "kelahiran", Label: "Kelahiran"},
			{Value: "penyiraman", Label: "Penyiraman"},
			{Value: "pemupukan", Label: "Pemupukan"},
			{Value: "pembersihan", Label: "Pembersihan Lahan"},
			{Value: "pemangkasan", Label: "Pemangkasan"},
			{Value: "panen", Label: "Panen"},
			{Value: "weighing", Label: "Penimbangan Berat"},
			{Value: "maintenance", Label: "Pemeliharaan"},
			{Value: "admin", Label: "Administrasi"},
			{Value: "pengolahan_pupuk", Label: "Pengolahan Pupuk"},
			{Value: "umum", Label: "Umum"},
		},
		TaskRincian: []EnumChoice{
			{Value: "Pakan Pagi", Label: "Pakan Pagi"},
			{Value: "Pakan Sore", Label: "Pakan Sore"},
			{Value: "Konversi Pakan", Label: "Konversi Pakan"},
			{Value: "Pemberian Obat", Label: "Pemberian Obat"},
			{Value: "Pemberian Vitamin", Label: "Pemberian Vitamin"},
			{Value: "Vaksinasi", Label: "Vaksinasi"},
			{Value: "Pemeriksaan Medis", Label: "Pemeriksaan Medis"},
			{Value: "Pembersihan Kandang", Label: "Pembersihan Kandang"},
			{Value: "Fermentasi Kotoran", Label: "Fermentasi Kotoran"},
			{Value: "Kawin Alami", Label: "Kawin Alami"},
			{Value: "Inseminasi Buatan", Label: "Inseminasi Buatan"},
			{Value: "Pencatatan Kelahiran", Label: "Pencatatan Kelahiran"},
			{Value: "Pemeriksaan Anak & Induk", Label: "Pemeriksaan Anak & Induk"},
			{Value: "Pupuk Kandang", Label: "Pupuk Kandang"},
			{Value: "Pupuk Kompos", Label: "Pupuk Kompos"},
		},
		DayOfWeek: []EnumChoice{
			{Value: "Senin", Label: "Senin"},
			{Value: "Selasa", Label: "Selasa"},
			{Value: "Rabu", Label: "Rabu"},
			{Value: "Kamis", Label: "Kamis"},
			{Value: "Jumat", Label: "Jumat"},
			{Value: "Sabtu", Label: "Sabtu"},
			{Value: "Minggu", Label: "Minggu"},
		},
		Frequency: []EnumChoice{
			{Value: "sekali", Label: "Sekali"},
			{Value: "harian", Label: "Harian"},
			{Value: "mingguan", Label: "Mingguan"},
			{Value: "bulanan", Label: "Bulanan"},
		},
		MatingMethod: []EnumChoice{
			{Value: "alami", Label: "Alami"},
			{Value: "ib", Label: "Inseminasi Buatan (IB)"},
		},
		MatingStatus: []EnumChoice{
			{Value: "proses", Label: "Dalam Proses"},
			{Value: "sukses", Label: "Sukses"},
			{Value: "gagal", Label: "Gagal"},
		},
		PregnancyStatus: []EnumChoice{
			{Value: "dikandung", Label: "Dikandung"},
			{Value: "melahirkan", Label: "Melahirkan"},
			{Value: "keguguran", Label: "Keguguran"},
		},
		OffspringGender: []EnumChoice{
			{Value: "jantan", Label: "Jantan"},
			{Value: "betina", Label: "Betina"},
			{Value: "campuran", Label: "Campuran"},
		},
		OffspringCondition: []EnumChoice{
			{Value: "sehat", Label: "Sehat"},
			{Value: "lemas", Label: "Lemas"},
			{Value: "cacat", Label: "Cacat"},
			{Value: "mati", Label: "Mati"},
		},
		ManureActivity: []EnumChoice{
			{Value: "collection", Label: "Pengumpulan"},
			{Value: "fermentation", Label: "Fermentasi"},
			{Value: "distribution", Label: "Penyaluran"},
		},
		ManureDest: []EnumChoice{
			{Value: "internal", Label: "Internal"},
			{Value: "internal_kebun", Label: "Internal Kebun"},
			{Value: "external_sale", Label: "Penjualan Eksternal"},
		},
		Priority: []EnumChoice{
			{Value: "rendah", Label: "Rendah"},
			{Value: "sedang", Label: "Sedang"},
			{Value: "tinggi", Label: "Tinggi"},
		},
		TaskStatus: []EnumChoice{
			{Value: "belum", Label: "Belum Dikerjakan"},
			{Value: "proses", Label: "Sedang Diproses"},
			{Value: "selesai", Label: "Selesai"},
			{Value: "terlambat", Label: "Terlambat"},
			{Value: "pending", Label: "Pending"},
			{Value: "done", Label: "Selesai (Done)"},
			{Value: "menunggu", Label: "Menunggu Validasi"},
		},
		HealthActions: []EnumChoice{
			{Value: "Vaksin Enterotoxemia", Label: "Vaksin Enterotoxemia"},
			{Value: "Vitamin", Label: "Vitamin"},
			{Value: "Obat Cacing", Label: "Obat Cacing"},
			{Value: "Antibiotik", Label: "Antibiotik"},
		},
		Medicines: []EnumChoice{
			{Value: "Clostridium Vaccine", Label: "Clostridium Vaccine (Vaksin)"},
			{Value: "Vit B-Complex", Label: "Vit B-Complex (Vitamin)"},
			{Value: "Albendazole", Label: "Albendazole (Obat Cacing)"},
			{Value: "Vitamin ADE", Label: "Vitamin ADE"},
			{Value: "Vitamin B12/PLEK", Label: "Vitamin B12/PLEK"},
			{Value: "Antibiotik K", Label: "Antibiotik K"},
		},
		ManureConditions: []EnumChoice{
			{Value: "basah", Label: "Basah"},
			{Value: "kering", Label: "Kering"},
			{Value: "campur", Label: "Campuran"},
		},
		PregnancyCheckMethods: []EnumChoice{
			{Value: "non_return_estrus", Label: "Non-Return Estrus"},
			{Value: "usg_palpasi", Label: "USG / Palpasi"},
			{Value: "manual", Label: "Manual / Palpasi Tangan"},
		},
		PregnancyCheckResults: []EnumChoice{
			{Value: "masih_menunggu", Label: "Masih Menunggu (Perlu Pemeriksaan Ulang Nanti)"},
			{Value: "bunting_terkonfirmasi", Label: "Bunting Terkonfirmasi"},
			{Value: "gagal", Label: "Gagal / Tidak Bunting"},
			{Value: "keguguran", Label: "Keguguran"},
		},
		EstrusCheckResults: []EnumChoice{
			{Value: "birahi", Label: "Birahi (Siap Kawin)"},
			{Value: "tidak_birahi", Label: "Tidak Birahi"},
		},
		DamConditions: []EnumChoice{
			{Value: "Sehat", Label: "Sehat"},
			{Value: "Lemas", Label: "Lemas"},
			{Value: "Perlu Penanganan", Label: "Perlu Penanganan"},
		},
	}
	return c.Status(fiber.StatusOK).JSON(response)
}

// Introspect validates a JWT token and returns user information.
func (h *AuthHandler) Introspect(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	token := strings.TrimPrefix(authHeader, "Bearer ")
	if token == "" {
		token = c.Cookies("access_token")
	}
	if token == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"valid":   false,
			"message": "token tidak ditemukan",
		})
	}

	result, err := h.useCase.Introspect(c.Context(), token)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	if !result.Valid {
		return c.Status(http.StatusUnauthorized).JSON(result)
	}

	return c.Status(http.StatusOK).JSON(result)
}

