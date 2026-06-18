package panen

import (
	"github.com/farmease/farmease-be/farmease/module/panen/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/panen/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/panen/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("panen",
	fx.Provide(
		postgresql.NewPanenRepository,
		usecase.NewPanenUsecase,
		http.NewPanenHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.PanenHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)
