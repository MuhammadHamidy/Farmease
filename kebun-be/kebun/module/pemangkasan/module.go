package pemangkasan

import (
	"github.com/farmease/kebun-be/kebun/module/pemangkasan/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/pemangkasan/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/pemangkasan/usecase"
	frameworkFiber "github.com/farmease/kebun-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("pemangkasan",
	fx.Provide(
		postgresql.NewPemangkasanRepository,
		usecase.NewPemangkasanUsecase,
		http.NewPemangkasanHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.PemangkasanHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)

