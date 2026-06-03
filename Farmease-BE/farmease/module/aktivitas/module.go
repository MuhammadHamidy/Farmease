package aktivitas

import (
	"github.com/farmease/farmease-be/farmease/module/aktivitas/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/aktivitas/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/aktivitas/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("aktivitas",
	fx.Provide(
		postgresql.NewAktivitasRepository,
		usecase.NewAktivitasUsecase,
		http.NewAktivitasHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.AktivitasHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)
