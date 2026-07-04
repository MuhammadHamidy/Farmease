package pencatatan_types

import (
	"github.com/farmease/kebun-be/kebun/module/pencatatan_types/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/pencatatan_types/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/pencatatan_types/usecase"
	frameworkFiber "github.com/farmease/kebun-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("pencatatan_types",
	fx.Provide(
		postgresql.NewRepository,
		usecase.NewUsecase,
		http.NewHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.Handler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)

