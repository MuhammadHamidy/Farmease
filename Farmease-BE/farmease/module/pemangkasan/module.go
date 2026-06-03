package pemangkasan

import (
	"github.com/farmease/farmease-be/farmease/module/pemangkasan/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/pemangkasan/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/pemangkasan/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
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
