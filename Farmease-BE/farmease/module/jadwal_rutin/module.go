package jadwal_rutin

import (
	"github.com/farmease/farmease-be/farmease/module/jadwal_rutin/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/jadwal_rutin/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/jadwal_rutin/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("jadwal_rutin",
	fx.Provide(
		postgresql.NewJadwalRutinRepository,
		usecase.NewJadwalRutinUsecase,
		http.NewJadwalRutinHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.JadwalRutinHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)
