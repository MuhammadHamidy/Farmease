package akun_lahan

import (
	"github.com/farmease/kebun-be/kebun/module/akun_lahan/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/akun_lahan/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/akun_lahan/usecase"
	frameworkFiber "github.com/farmease/kebun-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("akun_lahan",
	fx.Provide(
		postgresql.NewAkunLahanRepository,
		usecase.NewAkunLahanUsecase,
		http.NewAkunLahanHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.AkunLahanHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)

