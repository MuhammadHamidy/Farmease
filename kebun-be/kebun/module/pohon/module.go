package pohon

import (
	"github.com/farmease/kebun-be/kebun/module/pohon/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/pohon/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/pohon/usecase"
	frameworkFiber "github.com/farmease/kebun-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("pohon",
	fx.Provide(
		postgresql.NewPohonRepository,
		usecase.NewPohonUsecase,
		http.NewPohonHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.PohonHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)

