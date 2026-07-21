package pemupukan

import (
	"github.com/farmease/kebun-be/kebun/module/pemupukan/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/pemupukan/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/pemupukan/usecase"
	frameworkFiber "github.com/farmease/kebun-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("pemupukan",
	fx.Provide(
		postgresql.NewPemupukanRepository,
		usecase.NewPemupukanUsecase,
		http.NewPemupukanHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.PemupukanHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)

