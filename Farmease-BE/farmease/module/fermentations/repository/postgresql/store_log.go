package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/fermentations/domain"
)

func (r *Repository) StoreLog(ctx context.Context, log *domain.SilageFermentationLog) error {
	query := `
		INSERT INTO logistics.silage_fermentation_logs 
			(id_conversion, status, ph_level, temperature, physical_condition, notes)
		VALUES 
			($1, $2, $3, $4, $5, $6)
		RETURNING id_log, check_date, created_at`
	
	err := r.db.QueryRow(ctx, query, 
		log.IDConversion, 
		log.Status, 
		log.PHLevel, 
		log.Temperature, 
		log.PhysicalCondition, 
		log.Notes,
	).Scan(&log.IDLog, &log.CheckDate, &log.CreatedAt)

	return err
}
