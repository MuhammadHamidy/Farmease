package cmd

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	internalConfig "github.com/farmease/farmease-be/farmease/config"
	_ "github.com/farmease/farmease-be/farmease/docs"
	"github.com/farmease/farmease-be/framework/common/logger"
	"github.com/farmease/farmease-be/framework/config"
	"github.com/farmease/farmease-be/framework/fiber"
	"github.com/farmease/farmease-be/framework/otel"
	"github.com/farmease/farmease-be/framework/postgres"
	"github.com/farmease/farmease-be/framework/redis"
	"github.com/farmease/farmease-be/libraries/idp"
	"github.com/farmease/farmease-be/libraries/middleware"
	gofiber "github.com/gofiber/fiber/v2"
	"github.com/spf13/cobra"
	filterSwagger "github.com/swaggo/fiber-swagger"
	"go.uber.org/fx"

	// Farmease - Livestock (Peternakan)
	"github.com/farmease/farmease-be/farmease/module/breedings"
	"github.com/farmease/farmease-be/farmease/module/cages"
	"github.com/farmease/farmease-be/farmease/module/farms"
	"github.com/farmease/farmease-be/farmease/module/feeds"
	"github.com/farmease/farmease-be/farmease/module/healths"
	"github.com/farmease/farmease-be/farmease/module/manures"
	"github.com/farmease/farmease-be/farmease/module/notifications"
	"github.com/farmease/farmease-be/farmease/module/pregnancies"
	"github.com/farmease/farmease-be/farmease/module/sheep"
	"github.com/farmease/farmease-be/farmease/module/tasks"
	"github.com/farmease/farmease-be/farmease/module/upload"
	"github.com/farmease/farmease-be/farmease/module/weights"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules"
	"github.com/farmease/farmease-be/farmease/module/submissions"
)

// @title           Farmease API
// @version         1.0
// @description     API Documentation for Farmease Backend Service
// @termsOfService  http://swagger.io/terms/

// @contact.name    API Support
// @contact.email   support@farmease.id

// @license.name    Apache 2.0
// @license.url     http://www.apache.org/licenses/LICENSE-2.0.html

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
			internalConfig.Fiber,
			internalConfig.Otel,
			internalConfig.Logger,
			internalConfig.InternalApp,
			func(idpProvider idp.IDPProvider, appCfg *internalConfig.InternalAppConfig) *middleware.AuthorizationMiddleware {
				return middleware.NewAuthorizationMiddlewareWithSSO(idpProvider, nil, nil, appCfg.SsoApiUrl)
			},
		),

		middleware.HealthModule,

		// Livestock (Peternakan)
		farms.Module,
		cages.Module,
		sheep.Module,
		breedings.Module,
		pregnancies.Module,
		feeds.Module,
		weights.Module,
		healths.Module,
		manures.Module,
		tasks.Module,
		routine_schedules.Module,
		notifications.Module,
		upload.Module,
		submissions.Module,

		fx.Provide(
			fx.Annotate(
				idp.NewIDP,
				fx.As(new(idp.IDPProvider)),
			),
		),
		fx.Invoke(func(app *gofiber.App) {
			app.Get("/swagger/*", filterSwagger.WrapHandler)
			os.MkdirAll("./public/uploads", 0755)
			app.Static("/uploads", "./public/uploads")
		}),
		fx.Invoke(func(lc fx.Lifecycle, db *pgxpool.Pool) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					if db == nil {
						log.Println("DB_UPGRADE: pgxpool is nil, skipping upgrades")
						return nil
					}
					go func() {
						bgCtx := context.Background()
						log.Println("DB_UPGRADE: starting database enums and table updates in background")
						if _, err := db.Exec(bgCtx, "ALTER TYPE livestock.sheep_status_enum ADD VALUE IF NOT EXISTS 'eksternal'"); err != nil {
							log.Printf("DB_UPGRADE_ERROR: failed to alter sheep_status_enum: %v", err)
						}
						if _, err := db.Exec(bgCtx, "ALTER TYPE operations.task_rincian_enum ADD VALUE IF NOT EXISTS 'Kontrol Kebuntingan'"); err != nil {
							log.Printf("DB_UPGRADE_ERROR: failed to alter task_rincian_enum: %v", err)
						}
						if _, err := db.Exec(bgCtx, "ALTER TABLE breeding.matings ADD COLUMN IF NOT EXISTS straw_code VARCHAR(100) NULL"); err != nil {
							log.Printf("DB_UPGRADE_ERROR: failed to add straw_code to breeding.matings: %v", err)
						}
						if _, err := db.Exec(bgCtx, "ALTER TABLE breeding.matings ADD COLUMN IF NOT EXISTS inseminator VARCHAR(100) NULL"); err != nil {
							log.Printf("DB_UPGRADE_ERROR: failed to add inseminator to breeding.matings: %v", err)
						}
						if _, err := db.Exec(bgCtx, "ALTER TABLE operations.tasks ADD COLUMN IF NOT EXISTS id_mating UUID NULL REFERENCES breeding.matings(id_mating) ON DELETE SET NULL"); err != nil {
							log.Printf("DB_UPGRADE_ERROR: failed to add id_mating to operations.tasks: %v", err)
						}
						if _, err := db.Exec(bgCtx, "CREATE INDEX IF NOT EXISTS idx_tasks_id_mating ON operations.tasks(id_mating)"); err != nil {
							log.Printf("DB_UPGRADE_ERROR: failed to create tasks index: %v", err)
						}
						log.Println("DB_UPGRADE: database updates execution finished in background")
					}()
					return nil
				},
			})
		}),
	).Run()

	return nil
}
