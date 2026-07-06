package middleware

import (
	"strings"

	"github.com/farmease/sso-be/libraries/idp"
	"github.com/farmease/sso-be/libraries/ssoclient"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

const (
	authCookieKey   = "access_token"
	PrefixAuthToken = "auth:token:"
)

type (
	AuthorizationMiddleware struct {
		idp       idp.IDPProvider
		db        *pgxpool.Pool
		cache     redis.UniversalClient
		ssoClient *ssoclient.Client
	}
)

// NewAuthorizationMiddleware membuat middleware autentikasi standar (tanpa SSO client).
// Digunakan oleh BE-SSO yang tidak perlu memanggil service SSO eksternal.
func NewAuthorizationMiddleware(idp idp.IDPProvider, db *pgxpool.Pool, cache redis.UniversalClient) *AuthorizationMiddleware {
	return &AuthorizationMiddleware{idp: idp, db: db, cache: cache}
}

// NewAuthorizationMiddlewareWithSSO membuat middleware autentikasi dengan SSO client.
// Digunakan oleh BE-Peternakan dan BE-Perkebunan untuk memvalidasi token via BE-SSO.
func NewAuthorizationMiddlewareWithSSO(idp idp.IDPProvider, db *pgxpool.Pool, cache redis.UniversalClient, ssoURL string) *AuthorizationMiddleware {
	var sc *ssoclient.Client
	if ssoURL != "" {
		sc = ssoclient.NewClient(ssoURL)
	}
	return &AuthorizationMiddleware{idp: idp, db: db, cache: cache, ssoClient: sc}
}

const (
	XTokenKey        = "X-Token"
	XUserIdKey       = "X-User-Id"
	XExternalSubject = "X-External-Subject"
	XGroupKey        = "X-Group"
	XInstitutionId   = "X-Institution-Id"
	XOperatorCategory = "X-Operator-Category"
	XFarmID          = "X-Farm-Id"
)

// extractBearerToken mengambil token dari header Authorization.
func extractBearerToken(c *fiber.Ctx) string {
	authHeader := c.Get("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		return strings.TrimPrefix(authHeader, "Bearer ")
	}
	// Fallback ke cookie
	return c.Cookies(authCookieKey)
}

// Authenticate memvalidasi token.
// Jika ssoClient tersedia, validasi dilakukan dengan memanggil BE-SSO.
// Jika tidak ada ssoClient (mode dev / BE-SSO sendiri), request langsung diloloskan.
func (a *AuthorizationMiddleware) Authenticate(scopes ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Jika ssoClient dikonfigurasi, lakukan validasi token via SSO
		if a.ssoClient != nil {
			token := extractBearerToken(c)
			if token == "" {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"status":  "UNAUTHORIZED",
					"message": "token tidak ditemukan",
				})
			}

			userInfo, err := a.ssoClient.Introspect(token)
			if err != nil {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"status":  "UNAUTHORIZED",
					"message": "token tidak valid atau sudah kedaluwarsa",
				})
			}

			// Simpan info user ke context fiber
			c.Locals(XUserIdKey, userInfo.IDAccount)
			c.Locals(XTokenKey, token)
			c.Locals(XExternalSubject, userInfo.Username)
			c.Locals(XOperatorCategory, userInfo.OperatorCategory)
			if userInfo.FarmID != nil {
				c.Locals(XFarmID, *userInfo.FarmID)
			}
			c.Locals(XGroupKey, []string{userInfo.IDRole})
			c.Locals(XInstitutionId, "")
			return c.Next()
		}

		// Mode development / BE-SSO: bypass validasi token
		// NOTE: Token validation is disabled for development on SSO service itself.
		// TODO: Re-enable full validation before production deployment.
		c.Locals(XUserIdKey, "dev-user")
		c.Locals(XTokenKey, "")
		c.Locals(XExternalSubject, "")
		c.Locals(XInstitutionId, "")
		c.Locals(XGroupKey, []string{})
		return c.Next()
	}
}

