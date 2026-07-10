package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// =========================================================================
// 1. TEMPLATE MOCK REPOSITORY
// Menerapkan interface repository dari modul Anda untuk mensimulasikan DB.
// =========================================================================
type MockRepository struct {
	mock.Mock
}

// FindByID adalah contoh fungsi repositori yang di-mock
func (m *MockRepository) FindByID(ctx context.Context, id string) (interface{}, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0), args.Error(1)
}

// Save adalah contoh fungsi penyimpanan data yang di-mock
func (m *MockRepository) Save(ctx context.Context, data interface{}) error {
	args := m.Called(ctx, data)
	return args.Error(0)
}

// =========================================================================
// 2. TEMPLATE STRUKTUR USECASE / SERVICE
// Mewakili struktur usecase asli yang bergantung pada repository.
// =========================================================================
type SampleUseCase struct {
	repo *MockRepository
}

func NewSampleUseCase(repo *MockRepository) *SampleUseCase {
	return &SampleUseCase{repo: repo}
}

// ExecuteBusinessLogic adalah fungsi yang diuji
func (u *SampleUseCase) ExecuteBusinessLogic(ctx context.Context, id string) (string, error) {
	// Panggil repo
	data, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return "", errors.New("data tidak ditemukan")
	}

	// Simulasi pemrosesan logika bisnis
	result := "Hasil Pemrosesan: " + data.(string)
	return result, nil
}

// =========================================================================
// 3. TEMPLATE UNIT TEST (SCENARIO-BASED)
// =========================================================================

// TestSampleUseCase_ExecuteBusinessLogic_Success menguji skenario sukses
func TestSampleUseCase_ExecuteBusinessLogic_Success(t *testing.T) {
	// Arrange (Persiapan)
	mockRepo := new(MockRepository)
	useCase := NewSampleUseCase(mockRepo)
	ctx := context.Background()
	testID := "DOMBA-001"
	mockOutput := "Data Domba Sehat"

	// Definisikan ekspektasi Mock (Jika FindByID dipanggil, kembalikan mockOutput & nil)
	mockRepo.On("FindByID", ctx, testID).Return(mockOutput, nil)

	// Act (Eksekusi fungsi asli)
	result, err := useCase.ExecuteBusinessLogic(ctx, testID)

	// Assert (Verifikasi hasil)
	assert.NoError(t, err)
	assert.Equal(t, "Hasil Pemrosesan: Data Domba Sehat", result)
	mockRepo.AssertExpectations(t) // Pastikan mock dipanggil sesuai rencana
}

// TestSampleUseCase_ExecuteBusinessLogic_Failed menguji skenario error / gagal
func TestSampleUseCase_ExecuteBusinessLogic_Failed(t *testing.T) {
	// Arrange
	mockRepo := new(MockRepository)
	useCase := NewSampleUseCase(mockRepo)
	ctx := context.Background()
	testID := "DOMBA-NOT-FOUND"

	// Definisikan ekspektasi Mock mengembalikan error
	mockRepo.On("FindByID", ctx, testID).Return(nil, errors.New("sql: no rows in result set"))

	// Act
	result, err := useCase.ExecuteBusinessLogic(ctx, testID)

	// Assert
	assert.Error(t, err)
	assert.Equal(t, "data tidak ditemukan", err.Error())
	assert.Empty(t, result)
	mockRepo.AssertExpectations(t)
}
