package http

import (
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	"github.com/gofiber/fiber/v2"
)

type FeedHandler struct {
	useCase domain.UseCase
}

func NewFeedHandler(useCase domain.UseCase) *FeedHandler {
	return &FeedHandler{useCase: useCase}
}

func (h *FeedHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	// Global master feed endpoints
	feeds := api.Group("/feeds")
	h.registerFeedsGroup(feeds)
	feeds.Post("/mixtures", h.RecordFeedingMixture)
	feeds.Post("/conversions", h.RecordSilageConversion)
	feeds.Get("/conversions", h.GetSilageConversions)

	pakanMaster := api.Group("/pakan/master")
	h.registerFeedsGroup(pakanMaster)

	// Global feeding history list
	api.Get("/feedings", h.GetFeedingList)
	api.Get("/pemberian-pakan", h.GetFeedingList)

	// Sheep-specific feeding recommendations and logs
	sheep := api.Group("/sheep/:id")
	h.registerSheepGroup(sheep)

	domba := api.Group("/domba/:id")
	h.registerSheepGroup(domba)

	// Extra Indonesian-styled pakan endpoints
	api.Get("/pakan/rekomendasi/:id", h.GetFeedRecommendation)
	api.Get("/pakan/rekomendasi/kandang/:id", h.GetFeedRecommendationByCage)
}

func (h *FeedHandler) registerFeedsGroup(group fiber.Router) {
	group.Get("/", h.GetMasterFeedList)
	group.Post("/", h.AddMasterFeed)
	group.Patch("/:id/stock", h.UpdateFeedStock)
	group.Patch("/:id/stok", h.UpdateFeedStock) // Postman uses stok
}

func (h *FeedHandler) registerSheepGroup(group fiber.Router) {
	group.Get("/feed-recommendation", h.GetFeedRecommendation)
	group.Get("/feedings", h.GetFeedingHistory)
	group.Post("/feedings", h.RecordFeeding)
	group.Get("/pemberian-pakan", h.GetFeedingHistory)
	group.Post("/pemberian-pakan", h.RecordFeeding)
}
