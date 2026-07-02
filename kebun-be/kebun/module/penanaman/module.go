package penanaman

import (
	"github.com/farmease/farmease-be/farmease/module/penanaman/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/penanaman/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/penanaman/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
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
