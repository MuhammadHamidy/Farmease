package lahan

import (
	"github.com/farmease/farmease-be/farmease/module/lahan/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/lahan/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/lahan/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("lahan",
	fx.Provide(
		postgresql.NewLahanRepository,
		usecase.NewLahanUsecase,
		http.NewLahanHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.LahanHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)
