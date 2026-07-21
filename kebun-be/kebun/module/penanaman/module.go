package penanaman

import (
	"github.com/farmease/kebun-be/kebun/module/penanaman/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/penanaman/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/penanaman/usecase"
	frameworkFiber "github.com/farmease/kebun-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("penanaman",
	fx.Provide(
		postgresql.NewPenanamanRepository,
		usecase.NewPenanamanUsecase,
		http.NewPenanamanHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.PenanamanHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)

