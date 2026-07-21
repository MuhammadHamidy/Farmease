package usecase

import (
	breedingDomain "github.com/farmease/farmease-be/farmease/module/breedings/domain"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)




type useCase struct {
	repo       domain.PregnancyRepository
	sheepRepo  sheepDomain.SheepRepository
	matingRepo breedingDomain.BreedingRepository
	taskRepo   tasksDomain.TaskRepository
}

func NewUseCase(
	repo domain.PregnancyRepository,
	sheepRepo sheepDomain.SheepRepository,
	matingRepo breedingDomain.BreedingRepository,
	taskRepo tasksDomain.TaskRepository,
) domain.UseCase {
	return &useCase{
		repo:       repo,
		sheepRepo:  sheepRepo,
		matingRepo: matingRepo,
		taskRepo:   taskRepo,
	}
}
