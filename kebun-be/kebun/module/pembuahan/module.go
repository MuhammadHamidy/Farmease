package pembuahan

import (
	"github.com/farmease/farmease-be/farmease/module/pembuahan/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/pembuahan/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/pembuahan/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("pembuahan",
	fx.Provide(
		postgresql.NewPembuahanRepository,
		usecase.NewPembuahanUsecase,
		http.NewPembuahanHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.PembuahanHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)
