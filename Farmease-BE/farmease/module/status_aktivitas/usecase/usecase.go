package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/farmease/farmease-be/farmease/module/status_aktivitas/domain"
	notifikasiDomain "github.com/farmease/farmease-be/farmease/module/notifikasi/domain"
)

type statusAktivitasUsecase struct {
	repo           domain.StatusAktivitasRepository
	notifikasiRepo notifikasiDomain.NotifikasiRepository
}

func NewStatusAktivitasUsecase(
	repo domain.StatusAktivitasRepository,
	notifikasiRepo notifikasiDomain.NotifikasiRepository,
) domain.StatusAktivitasUsecase {
	return &statusAktivitasUsecase{
		repo:           repo,
		notifikasiRepo: notifikasiRepo,
	}
}

func (u *statusAktivitasUsecase) FindAll(ctx context.Context) ([]domain.StatusAktivitas, error) {
	return u.repo.FindAll(ctx)
}

func (u *statusAktivitasUsecase) FindByID(ctx context.Context, id int) (*domain.StatusAktivitas, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *statusAktivitasUsecase) Create(ctx context.Context, sa *domain.StatusAktivitas) error {
	err := u.repo.Store(ctx, sa)
	if err != nil {
		return err
	}

	// Trigger notification
	namaAktivitas := sa.NamaRincianAktivitas
	if namaAktivitas == "" {
		namaAktivitas = sa.NamaJenisAktivitas
	}
	if namaAktivitas == "" {
		namaAktivitas = fmt.Sprintf("Aktivitas ID %d", sa.AktivitasIDAktivitas)
	}

	pesan := fmt.Sprintf("Status tugas [%s] telah dibuat dengan status [%s]", namaAktivitas, sa.Status)
	if sa.Keterangan != "" {
		pesan = fmt.Sprintf("%s. Keterangan: %s", pesan, sa.Keterangan)
	}

	notif := &notifikasiDomain.Notifikasi{
		TipeNotifikasi:   "Status Aktivitas",
		Pesan:            pesan,
		StatusNotifikasi: "Belum Dibaca",
		Tanggal:          time.Now().Format("2006-01-02 15:04:05"),
	}

	// Store notification
	_ = u.notifikasiRepo.Store(ctx, notif)

	return nil
}

func (u *statusAktivitasUsecase) Update(ctx context.Context, sa *domain.StatusAktivitas) error {
	err := u.repo.Update(ctx, sa)
	if err != nil {
		return err
	}

	// Fetch full details of updated status to get activity names
	updated, err := u.repo.FindByID(ctx, sa.IDStatusAktivitas)
	if err == nil && updated != nil {
		sa.NamaJenisAktivitas = updated.NamaJenisAktivitas
		sa.NamaRincianAktivitas = updated.NamaRincianAktivitas
	}

	// Trigger notification
	namaAktivitas := sa.NamaRincianAktivitas
	if namaAktivitas == "" {
		namaAktivitas = sa.NamaJenisAktivitas
	}
	if namaAktivitas == "" {
		namaAktivitas = fmt.Sprintf("Aktivitas ID %d", sa.AktivitasIDAktivitas)
	}

	pesan := fmt.Sprintf("Status tugas [%s] telah diperbarui menjadi [%s]", namaAktivitas, sa.Status)
	if sa.Keterangan != "" {
		pesan = fmt.Sprintf("%s. Keterangan: %s", pesan, sa.Keterangan)
	}

	notif := &notifikasiDomain.Notifikasi{
		TipeNotifikasi:   "Status Aktivitas",
		Pesan:            pesan,
		StatusNotifikasi: "Belum Dibaca",
		Tanggal:          time.Now().Format("2006-01-02 15:04:05"),
	}

	// Store notification
	_ = u.notifikasiRepo.Store(ctx, notif)

	return nil
}

func (u *statusAktivitasUsecase) Delete(ctx context.Context, id int) error {
	return u.repo.Delete(ctx, id)
}
