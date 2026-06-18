package usecase

import (
	"context"
	"testing"
	"time"

	breedingDomain "github.com/farmease/farmease-be/farmease/module/breedings/domain"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

type mockPregnancyRepo struct {
	pregnancies []*domain.Pregnancy
	births      []*domain.Birth
	weights     map[string]float64
}

func (m *mockPregnancyRepo) FindAllPregnancies(ctx context.Context, status string) ([]*domain.Pregnancy, error) {
	var list []*domain.Pregnancy
	for _, p := range m.pregnancies {
		if status == "" || p.PregnancyStatus == status {
			list = append(list, p)
		}
	}
	return list, nil
}
func (m *mockPregnancyRepo) StorePregnancy(ctx context.Context, k *domain.Pregnancy) error {
	if k.IDPregnancy == "" {
		k.IDPregnancy = "preg-1"
	}
	m.pregnancies = append(m.pregnancies, k)
	return nil
}
func (m *mockPregnancyRepo) UpdatePregnancyStatus(ctx context.Context, id string, status string, notes string) error {
	for _, p := range m.pregnancies {
		if p.IDPregnancy == id {
			p.PregnancyStatus = status
			p.Notes = notes
			return nil
		}
	}
	return nil
}
func (m *mockPregnancyRepo) StoreBirth(ctx context.Context, k *domain.Birth) error {
	if k.IDBirth == "" {
		k.IDBirth = "birth-1"
	}
	m.births = append(m.births, k)
	return nil
}
func (m *mockPregnancyRepo) StoreBirthWeight(ctx context.Context, idSheep string, date time.Time, weight float64) error {
	m.weights[idSheep] = weight
	return nil
}
func (m *mockPregnancyRepo) FindAllBirths(ctx context.Context, from, to *time.Time) ([]*domain.Birth, error) {
	return m.births, nil
}
func (m *mockPregnancyRepo) GetPregnancyDetail(ctx context.Context, id string) (*domain.Pregnancy, error) {
	for _, p := range m.pregnancies {
		if p.IDPregnancy == id {
			return p, nil
		}
	}
	return nil, nil
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

type mockMatingRepo struct {
	matingStore map[string]*breedingDomain.Mating
}

func (m *mockMatingRepo) FindAll(ctx context.Context, status string, inbreedingFlag *bool) ([]*breedingDomain.Mating, error) {
	return nil, nil
}
func (m *mockMatingRepo) FindByID(ctx context.Context, id string) (*breedingDomain.Mating, error) {
	if mating, ok := m.matingStore[id]; ok {
		return mating, nil
	}
	return nil, nil
}
func (m *mockMatingRepo) Store(ctx context.Context, mating *breedingDomain.Mating) error {
	return nil
}
func (m *mockMatingRepo) UpdateStatus(ctx context.Context, id string, status string, notes string) error {
	if mating, ok := m.matingStore[id]; ok {
		mating.Status = status
		mating.Notes = notes
	}
	return nil
}
func (m *mockMatingRepo) GetAncestors(ctx context.Context, id string, maxGeneration int) (map[string][]int, error) {
	return nil, nil
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

func TestCheckPregnancy_BuntingTerkonfirmasi(t *testing.T) {
	pregRepo := &mockPregnancyRepo{weights: make(map[string]float64)}
	sheepRepo := &mockSheepRepo{sheepStore: make(map[string]*sheepDomain.Sheep)}
	matingRepo := &mockMatingRepo{matingStore: make(map[string]*breedingDomain.Mating)}
	taskRepo := &mockTaskRepo{}

	uc := NewUseCase(pregRepo, sheepRepo, matingRepo, taskRepo)
	ctx := context.Background()

	// Setup female sheep
	female := &sheepDomain.Sheep{
		IDSheep:   "female-1",
		SheepCode: "FEM-1",
		Status:    "aktif",
		IDCage:    "cage-10",
	}
	sheepRepo.sheepStore[female.IDSheep] = female

	// Setup mating
	matingDate := time.Date(2026, 6, 18, 0, 0, 0, 0, time.UTC)
	mating := &breedingDomain.Mating{
		IDMating:      "mating-1",
		IDSheepFemale: "female-1",
		MatingDate:    matingDate,
		Status:        "proses",
	}
	matingRepo.matingStore[mating.IDMating] = mating

	// Setup check task
	task := &tasksDomain.Task{
		IDTask:  "task-check-1",
		Status:  "pending",
		Rincian: "Kontrol Kebuntingan",
	}
	taskRepo.tasks = append(taskRepo.tasks, task)

	req := domain.PregnancyCheckRequest{
		IDMating:           "mating-1",
		TanggalPemeriksaan: matingDate.AddDate(0, 0, 21),
		Hasil:              "bunting_terkonfirmasi",
		Catatan:            "USG positive",
		IDTask:             "task-check-1",
	}

	err := uc.CheckPregnancy(ctx, req)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// 1. Sheep status should be 'hamil'
	if female.Status != "hamil" {
		t.Errorf("expected female status to be 'hamil', got %s", female.Status)
	}

	// 2. Pregnancy record stored
	if len(pregRepo.pregnancies) != 1 {
		t.Fatalf("expected 1 pregnancy record, got %d", len(pregRepo.pregnancies))
	}
	p := pregRepo.pregnancies[0]
	if p.PregnancyStatus != "dikandung" {
		t.Errorf("expected pregnancy status to be 'dikandung', got %s", p.PregnancyStatus)
	}

	expectedBirthDate := matingDate.AddDate(0, 0, 148)
	if !p.ExpectedBirthDate.Equal(expectedBirthDate) {
		t.Errorf("expected expected birth date to be %s, got %s", expectedBirthDate, p.ExpectedBirthDate)
	}

	// 3. Current task should be 'selesai'
	if task.Status != "selesai" {
		t.Errorf("expected task status to be 'selesai', got %s", task.Status)
	}

	// 4. New task scheduled
	if len(taskRepo.tasks) != 2 {
		t.Fatalf("expected 2 tasks total, got %d", len(taskRepo.tasks))
	}
	newTask := taskRepo.tasks[1]
	if newTask.Rincian != "Pencatatan Kelahiran" {
		t.Errorf("expected new task rincian to be 'Pencatatan Kelahiran', got %s", newTask.Rincian)
	}
	if !newTask.TaskDate.Equal(expectedBirthDate) {
		t.Errorf("expected new task date to be %s, got %s", expectedBirthDate, newTask.TaskDate)
	}
}

func TestCheckPregnancy_MasihMenunggu(t *testing.T) {
	pregRepo := &mockPregnancyRepo{weights: make(map[string]float64)}
	sheepRepo := &mockSheepRepo{sheepStore: make(map[string]*sheepDomain.Sheep)}
	matingRepo := &mockMatingRepo{matingStore: make(map[string]*breedingDomain.Mating)}
	taskRepo := &mockTaskRepo{}

	uc := NewUseCase(pregRepo, sheepRepo, matingRepo, taskRepo)
	ctx := context.Background()

	female := &sheepDomain.Sheep{IDSheep: "female-1", SheepCode: "FEM-1", Status: "aktif"}
	sheepRepo.sheepStore[female.IDSheep] = female

	mating := &breedingDomain.Mating{IDMating: "mating-1", IDSheepFemale: "female-1", MatingDate: time.Now(), Status: "proses"}
	matingRepo.matingStore[mating.IDMating] = mating

	task := &tasksDomain.Task{IDTask: "task-check-1", Status: "pending"}
	taskRepo.tasks = append(taskRepo.tasks, task)

	req := domain.PregnancyCheckRequest{
		IDMating:           "mating-1",
		TanggalPemeriksaan: time.Now(),
		Hasil:              "masih_menunggu",
		IDTask:             "task-check-1",
	}

	err := uc.CheckPregnancy(ctx, req)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Check current task completed
	if task.Status != "selesai" {
		t.Errorf("expected task status to be 'selesai', got %s", task.Status)
	}

	// Check new task scheduled (+21 days)
	if len(taskRepo.tasks) != 2 {
		t.Fatalf("expected 2 tasks total, got %d", len(taskRepo.tasks))
	}
	newTask := taskRepo.tasks[1]
	if newTask.Rincian != "Kontrol Kebuntingan" {
		t.Errorf("expected new task rincian to be 'Kontrol Kebuntingan', got %s", newTask.Rincian)
	}
}

func TestCheckPregnancy_Gagal(t *testing.T) {
	pregRepo := &mockPregnancyRepo{weights: make(map[string]float64)}
	sheepRepo := &mockSheepRepo{sheepStore: make(map[string]*sheepDomain.Sheep)}
	matingRepo := &mockMatingRepo{matingStore: make(map[string]*breedingDomain.Mating)}
	taskRepo := &mockTaskRepo{}

	uc := NewUseCase(pregRepo, sheepRepo, matingRepo, taskRepo)
	ctx := context.Background()

	female := &sheepDomain.Sheep{IDSheep: "female-1", SheepCode: "FEM-1", Status: "aktif"}
	sheepRepo.sheepStore[female.IDSheep] = female

	mating := &breedingDomain.Mating{IDMating: "mating-1", IDSheepFemale: "female-1", Status: "proses"}
	matingRepo.matingStore[mating.IDMating] = mating

	req := domain.PregnancyCheckRequest{
		IDMating: "mating-1",
		Hasil:    "gagal",
	}

	err := uc.CheckPregnancy(ctx, req)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if mating.Status != "gagal" {
		t.Errorf("expected mating status to be 'gagal', got %s", mating.Status)
	}
	if female.Status != "aktif" {
		t.Errorf("expected sheep status to be 'aktif', got %s", female.Status)
	}
}

func TestRecordBirth(t *testing.T) {
	pregRepo := &mockPregnancyRepo{weights: make(map[string]float64)}
	sheepRepo := &mockSheepRepo{sheepStore: make(map[string]*sheepDomain.Sheep)}
	matingRepo := &mockMatingRepo{matingStore: make(map[string]*breedingDomain.Mating)}
	taskRepo := &mockTaskRepo{}

	uc := NewUseCase(pregRepo, sheepRepo, matingRepo, taskRepo)
	ctx := context.Background()

	pregnancy := &domain.Pregnancy{
		IDPregnancy:     "preg-1",
		IDMating:        "mating-1",
		PregnancyStatus: "dikandung",
		IDFather:        "father-1",
		IDMother:        "mother-1",
	}
	pregRepo.pregnancies = append(pregRepo.pregnancies, pregnancy)

	mating := &breedingDomain.Mating{IDMating: "mating-1", Status: "proses"}
	matingRepo.matingStore[mating.IDMating] = mating

	mother := &sheepDomain.Sheep{IDSheep: "mother-1", Status: "hamil"}
	sheepRepo.sheepStore[mother.IDSheep] = mother

	birthTask := &tasksDomain.Task{IDTask: "task-birth-1", Status: "pending"}
	taskRepo.tasks = append(taskRepo.tasks, birthTask)

	birth := &domain.Birth{
		IDPregnancy:       "preg-1",
		BirthDate:         time.Now(),
		NumberOfOffspring: 2,
		IDTask:            "task-birth-1",
		OffspringList: []domain.NewOffspring{
			{SheepCode: "CHILD-1", SheepName: "Anak 1", Gender: "jantan", BirthWeight: 3.5},
			{SheepCode: "CHILD-2", SheepName: "Anak 2", Gender: "betina", BirthWeight: 3.2},
		},
	}

	err := uc.RecordBirth(ctx, birth)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// 1. Offspring registered
	if len(sheepRepo.sheepStore) != 3 { // mother + 2 children
		t.Errorf("expected 3 sheep in store, got %d", len(sheepRepo.sheepStore))
	}
	c1, ok1 := sheepRepo.sheepStore["sheep-CHILD-1"]
	if !ok1 {
		t.Fatal("expected CHILD-1 to be registered")
	}
	if *c1.IDFather != "father-1" || *c1.IDMother != "mother-1" {
		t.Errorf("expected CHILD-1 pedigree to be father-1/mother-1, got father=%v, mother=%v", *c1.IDFather, *c1.IDMother)
	}

	// 2. Pregnancy status set to 'melahirkan'
	if pregnancy.PregnancyStatus != "melahirkan" {
		t.Errorf("expected pregnancy status to be 'melahirkan', got %s", pregnancy.PregnancyStatus)
	}

	// 3. Mother status back to 'aktif'
	if mother.Status != "aktif" {
		t.Errorf("expected mother status back to 'aktif', got %s", mother.Status)
	}

	// 4. Mating status 'sukses'
	if mating.Status != "sukses" {
		t.Errorf("expected mating status to be 'sukses', got %s", mating.Status)
	}

	// 5. Birth task marked completed
	if birthTask.Status != "selesai" {
		t.Errorf("expected birth task status to be 'selesai', got %s", birthTask.Status)
	}
}
