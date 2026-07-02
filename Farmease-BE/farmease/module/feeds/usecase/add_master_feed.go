package usecase

import (
	"context"
	"strings"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (u *useCase) AddMasterFeed(ctx context.Context, p *domain.Feed) error {
	cat := strings.ToLower(strings.TrimSpace(p.Category))
	if cat == "silase" {
		cat = "hijauan"
	}
	switch cat {
	case "hijauan", "konsentrat", "pellet", "greenery", "vitamin":
		p.Category = cat
	default:
		p.Category = "hijauan"
	}
	return u.repo.StoreMaster(ctx, p)
}
