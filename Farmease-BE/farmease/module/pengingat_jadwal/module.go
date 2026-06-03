package pengingat_jadwal

import (
	"github.com/farmease/farmease-be/farmease/module/pengingat_jadwal/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/pengingat_jadwal/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/pengingat_jadwal/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("pengingat_jadwal",
	fx.Provide(
		postgresql.NewPengingatJadwalRepository,
		usecase.NewPengingatJadwalUsecase,
		http.NewPengingatJadwalHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.PengingatJadwalHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)
