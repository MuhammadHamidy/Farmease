package cmd

import (
	"strings"

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

	// Gardening (Perkebunan)
	"github.com/farmease/farmease-be/farmease/module/akun_lahan"
	"github.com/farmease/farmease-be/farmease/module/lahan"
	"github.com/farmease/farmease-be/farmease/module/panen"
	"github.com/farmease/farmease-be/farmease/module/pemangkasan"
	"github.com/farmease/farmease-be/farmease/module/perawatan"
	"github.com/farmease/farmease-be/farmease/module/pohon"
	"github.com/farmease/farmease-be/farmease/module/fertilizers"
	"github.com/farmease/farmease-be/farmease/module/tasks"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules"
	"github.com/farmease/farmease-be/farmease/module/notifications"
	"github.com/farmease/farmease-be/farmease/module/submissions"
	"github.com/farmease/farmease-be/farmease/module/pencatatan_types"
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

		// Gardening (Perkebunan)
		lahan.Module,
		pohon.Module,
		perawatan.Module,
		pemangkasan.Module,
		panen.Module,
		akun_lahan.Module,
		fertilizers.Module,
		tasks.Module,
		routine_schedules.Module,
		notifications.Module,
		submissions.Module,
		pencatatan_types.Module,

		fx.Provide(
			fx.Annotate(
				idp.NewIDP,
				fx.As(new(idp.IDPProvider)),
			),
		),
		fx.Invoke(func(app *gofiber.App) {
			app.Get("/swagger/*", filterSwagger.WrapHandler)
		}),
	).Run()

	return nil
}
