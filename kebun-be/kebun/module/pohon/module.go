package pohon

import (
	"github.com/farmease/farmease-be/farmease/module/pohon/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/pohon/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/pohon/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
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
