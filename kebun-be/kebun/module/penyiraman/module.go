package penyiraman

import (
	"github.com/farmease/kebun-be/kebun/module/penyiraman/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/penyiraman/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/penyiraman/usecase"
	frameworkFiber "github.com/farmease/kebun-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("penyiraman",
	fx.Provide(
		postgresql.NewPenyiramanRepository,
		usecase.NewPenyiramanUsecase,
		http.NewPenyiramanHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.PenyiramanHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)

