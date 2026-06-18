package status_aktivitas

import (
	"github.com/farmease/farmease-be/farmease/module/status_aktivitas/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/status_aktivitas/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/status_aktivitas/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("status_aktivitas",
	fx.Provide(
		postgresql.NewStatusAktivitasRepository,
		usecase.NewStatusAktivitasUsecase,
		http.NewStatusAktivitasHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.StatusAktivitasHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)
