package perawatan

import (
	"github.com/farmease/farmease-be/farmease/module/perawatan/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/perawatan/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/perawatan/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("perawatan",
	fx.Provide(
		postgresql.NewPerawatanRepository,
		usecase.NewPerawatanUsecase,
		http.NewPerawatanHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.PerawatanHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)
