package pengobatan

import (
	"github.com/farmease/farmease-be/farmease/module/pengobatan/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/pengobatan/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/pengobatan/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
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
