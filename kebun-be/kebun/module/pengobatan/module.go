package pengobatan

import (
	"github.com/farmease/kebun-be/kebun/module/pengobatan/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/pengobatan/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/pengobatan/usecase"
	frameworkFiber "github.com/farmease/kebun-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("pengobatan",
	fx.Provide(
		postgresql.NewPengobatanRepository,
		usecase.NewPengobatanUsecase,
		http.NewPengobatanHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.PengobatanHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)

