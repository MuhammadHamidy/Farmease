package usecase

import (
	"context"
	"testing"
	"time"

	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

type mockBreedingRepo struct {
	matingStore map[string]*domain.Mating
	ancestors   map[string]map[string][]int
}

func (m *mockBreedingRepo) FindAll(ctx context.Context, status string, inbreedingFlag *bool) ([]*domain.Mating, error) {
	return nil, nil
}
func (m *mockBreedingRepo) FindByID(ctx context.Context, id string) (*domain.Mating, error) {
	if mating, ok := m.matingStore[id]; ok {
		return mating, nil
	}
	return nil, nil
}
func (m *mockBreedingRepo) Store(ctx context.Context, mating *domain.Mating) error {
	if mating.IDMating == "" {
		mating.IDMating = "mating-1"
	}
	m.matingStore[mating.IDMating] = mating
	return nil
}
func (m *mockBreedingRepo) UpdateStatus(ctx context.Context, id string, status string, notes string) error {
	if mating, ok := m.matingStore[id]; ok {
		mating.Status = status
		mating.Notes = notes
	}
	return nil
}
func (m *mockBreedingRepo) GetAncestors(ctx context.Context, id string, maxGeneration int) (map[string][]int, error) {
	if a, ok := m.ancestors[id]; ok {
		return a, nil
	}
	return make(map[string][]int), nil
}

type mockSheepRepo struct {
	sheepStore map[string]*sheepDomain.Sheep
}

func (m *mockSheepRepo) FindAll(ctx context.Context, filter sheepDomain.SheepFilter) ([]*sheepDomain.Sheep, int, error) {
	return nil, 0, nil
}
func (m *mockSheepRepo) FindByID(ctx context.Context, id string) (*sheepDomain.Sheep, error) {
	if s, ok := m.sheepStore[id]; ok {
		return s, nil
	}
	return &sheepDomain.Sheep{IDSheep: id, SheepCode: "SHEEP-" + id, IDCage: "cage-1"}, nil
}
func (m *mockSheepRepo) FindByCode(ctx context.Context, code string) (*sheepDomain.Sheep, error) {
	return nil, nil
}
func (m *mockSheepRepo) FindExternalDonor(ctx context.Context, name, origin string) (*sheepDomain.Sheep, error) {
	for _, s := range m.sheepStore {
		if s.Status == "eksternal" && s.SheepName == name && s.Origin == origin {
			return s, nil
		}
	}
	return nil, nil
}
func (m *mockSheepRepo) Store(ctx context.Context, s *sheepDomain.Sheep) error {
	if s.IDSheep == "" {
		s.IDSheep = "sheep-" + s.SheepCode
	}
	m.sheepStore[s.IDSheep] = s
	return nil
}
func (m *mockSheepRepo) Update(ctx context.Context, s *sheepDomain.Sheep) error {
	m.sheepStore[s.IDSheep] = s
	return nil
}
func (m *mockSheepRepo) UpdateStatus(ctx context.Context, id string, status string, notes string) error {
	if s, ok := m.sheepStore[id]; ok {
		s.Status = status
	}
	return nil
}
func (m *mockSheepRepo) GetGenealogy(ctx context.Context, id string, maxGeneration int) (*sheepDomain.Genealogy, error) {
	return nil, nil
}
func (m *mockSheepRepo) FindAllTypes(ctx context.Context) ([]*sheepDomain.SheepType, error) {
	return nil, nil
}
func (m *mockSheepRepo) StoreType(ctx context.Context, t *sheepDomain.SheepType) error {
	return nil
}
func (m *mockSheepRepo) UpdateType(ctx context.Context, id string, t *sheepDomain.SheepType) error {
	return nil
}

type mockTaskRepo struct {
	tasks []*tasksDomain.Task
}

func (m *mockTaskRepo) FindTasksByAccount(ctx context.Context, idAccount, roleName string, date *time.Time) ([]*tasksDomain.Task, error) {
	return nil, nil
}
func (m *mockTaskRepo) FindByID(ctx context.Context, id string) (*tasksDomain.Task, error) {
	return nil, nil
}
func (m *mockTaskRepo) StoreTask(ctx context.Context, t *tasksDomain.Task) error {
	m.tasks = append(m.tasks, t)
	return nil
}
func (m *mockTaskRepo) UpdateTask(ctx context.Context, t *tasksDomain.Task) error {
	return nil
}
func (m *mockTaskRepo) UpdateTaskStatus(ctx context.Context, id string, status string) error {
	for _, t := range m.tasks {
		if t.IDTask == id {
			t.Status = status
			return nil
		}
	}
	return nil
}
func (m *mockTaskRepo) DeleteTask(ctx context.Context, id string) error {
	return nil
}
func (m *mockTaskRepo) FindByScheduleAndDate(ctx context.Context, scheduleID string, taskDate time.Time) (*tasksDomain.Task, error) {
	return nil, nil
}

func TestRecordMating_Validation(t *testing.T) {
	matingRepo := &mockBreedingRepo{matingStore: make(map[string]*domain.Mating)}
	sheepRepo := &mockSheepRepo{sheepStore: make(map[string]*sheepDomain.Sheep)}
	taskRepo := &mockTaskRepo{}
	uc := NewUseCase(matingRepo, sheepRepo, taskRepo)

	ctx := context.Background()

	// 1. Missing female sheep
	mating := &domain.Mating{
		MatingMethod: "ib",
		IDSheepMale:  "male-1",
	}
	err := uc.RecordMating(ctx, mating)
	if err == nil || err.Error() != "domba betina wajib terisi" {
		t.Errorf("expected error 'domba betina wajib terisi', got %v", err)
	}

	// 2. IB - missing male and external donor
	mating = &domain.Mating{
		MatingMethod:  "ib",
		IDSheepFemale: "female-1",
	}
	err = uc.RecordMating(ctx, mating)
	if err == nil || err.Error() != "sumber pejantan (internal atau external donor) wajib terisi untuk inseminasi buatan" {
		t.Errorf("expected error for missing IB sire, got %v", err)
	}

	// 3. Alami - missing male
	mating = &domain.Mating{
		MatingMethod:  "alami",
		IDSheepFemale: "female-1",
	}
	err = uc.RecordMating(ctx, mating)
	if err == nil || err.Error() != "pejantan wajib terisi untuk kawin alami" {
		t.Errorf("expected error for missing natural mating sire, got %v", err)
	}
}

func TestRecordMating_SuccessAndFollowUpTask(t *testing.T) {
	matingRepo := &mockBreedingRepo{matingStore: make(map[string]*domain.Mating)}
	sheepRepo := &mockSheepRepo{sheepStore: make(map[string]*sheepDomain.Sheep)}
	taskRepo := &mockTaskRepo{}
	uc := NewUseCase(matingRepo, sheepRepo, taskRepo)

	ctx := context.Background()

	matingDate := time.Date(2026, 6, 18, 0, 0, 0, 0, time.UTC)
	mating := &domain.Mating{
		IDSheepFemale: "female-1",
		MatingMethod:  "ib",
		ExternalDonor: &domain.ExternalDonor{
			Name:   "Straw-X",
			Origin: "External Supplier",
		},
		MatingDate: matingDate,
	}

	err := uc.RecordMating(ctx, mating)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verify external donor was created
	var donor *sheepDomain.Sheep
	for _, s := range sheepRepo.sheepStore {
		if s.Status == "eksternal" && s.SheepName == "Straw-X" {
			donor = s
			break
		}
	}
	if donor == nil {
		t.Fatal("expected external donor to be created")
	}
	if mating.IDSheepMale != donor.IDSheep {
		t.Errorf("expected mating IDSheepMale to be set to donor's ID %s, got %s", donor.IDSheep, mating.IDSheepMale)
	}

	// Verify auto-scheduled task
	if len(taskRepo.tasks) != 1 {
		t.Fatalf("expected 1 task to be scheduled, got %d", len(taskRepo.tasks))
	}

	task := taskRepo.tasks[0]
	if task.Rincian != "Kontrol Kebuntingan" {
		t.Errorf("expected task rincian to be 'Kontrol Kebuntingan', got %s", task.Rincian)
	}

	expectedTaskDate := matingDate.AddDate(0, 0, 21)
	if !task.TaskDate.Equal(expectedTaskDate) {
		t.Errorf("expected task date to be %s, got %s", expectedTaskDate, task.TaskDate)
	}
}

func TestRecordMating_InbreedingDonor(t *testing.T) {
	matingRepo := &mockBreedingRepo{matingStore: make(map[string]*domain.Mating)}
	sheepRepo := &mockSheepRepo{sheepStore: make(map[string]*sheepDomain.Sheep)}
	taskRepo := &mockTaskRepo{}
	uc := NewUseCase(matingRepo, sheepRepo, taskRepo)

	ctx := context.Background()

	mating := &domain.Mating{
		IDSheepFemale: "female-1",
		MatingMethod:  "ib",
		ExternalDonor: &domain.ExternalDonor{
			Name:   "Straw-X",
			Origin: "External Supplier",
		},
		MatingDate: time.Now(),
	}

	err := uc.RecordMating(ctx, mating)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if mating.InbreedingFlag != false || mating.CoefficientOfInbreeding != 0.0 {
		t.Errorf("expected inbreeding with external donor to be false and 0.0, got flag=%v, coi=%f", mating.InbreedingFlag, mating.CoefficientOfInbreeding)
	}
}
