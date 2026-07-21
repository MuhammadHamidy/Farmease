package fermentasi

import (
	"github.com/farmease/kebun-be/kebun/module/fermentasi/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/fermentasi/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/fermentasi/usecase"
	frameworkFiber "github.com/farmease/kebun-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("fermentasi",
	fx.Provide(
		postgresql.NewFermentasiRepository,
		usecase.NewFermentasiUsecase,
		http.NewFermentasiHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.FermentasiHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)

