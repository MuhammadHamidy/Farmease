package notifikasi

import (
	"github.com/farmease/farmease-be/farmease/module/notifikasi/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/notifikasi/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/notifikasi/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("notifikasi",
	fx.Provide(
		postgresql.NewNotifikasiRepository,
		usecase.NewNotifikasiUsecase,
		http.NewNotifikasiHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.NotifikasiHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)
