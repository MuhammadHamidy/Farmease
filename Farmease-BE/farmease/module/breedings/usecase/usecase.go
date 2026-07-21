package usecase

import (
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)




type useCase struct {
	repo      domain.BreedingRepository
	sheepRepo sheepDomain.SheepRepository
	taskRepo  tasksDomain.TaskRepository
}

func NewUseCase(
	repo domain.BreedingRepository,
	sheepRepo sheepDomain.SheepRepository,
	taskRepo tasksDomain.TaskRepository,
) domain.UseCase {
	return &useCase{
		repo:      repo,
		sheepRepo: sheepRepo,
		taskRepo:  taskRepo,
	}
}
