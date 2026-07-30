package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/fermentations/domain"
)

// FindLogsByConversionID retrieves fermentation logs by conversion ID.
func (r *Repository) FindLogsByConversionID(ctx context.Context, conversionID string) ([]*domain.SilageFermentationLog, error) {
	query := `
		SELECT id_log, id_conversion, check_date, status, ph_level, temperature, physical_condition, notes, created_at
		FROM logistics.silage_fermentation_logs
		WHERE id_conversion = $1
		ORDER BY check_date DESC`

	rows, err := r.db.Query(ctx, query, conversionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logList []*domain.SilageFermentationLog
	for rows.Next() {
		var log domain.SilageFermentationLog
		err := rows.Scan(
			&log.IDLog,
			&log.IDConversion,
			&log.CheckDate,
			&log.Status,
			&log.PHLevel,
			&log.Temperature,
			&log.PhysicalCondition,
			&log.Notes,
			&log.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		logList = append(logList, &log)
	}
	return logList, nil
}

// FindLatestLogByConversionID fetches the most recent fermentation status log for a conversion ID.
func (r *Repository) FindLatestLogByConversionID(ctx context.Context, conversionID string) (*domain.SilageFermentationLog, error) {
	query := `
		SELECT id_log, id_conversion, check_date, status, ph_level, temperature, physical_condition, notes, created_at
		FROM logistics.silage_fermentation_logs
		WHERE id_conversion = $1
		ORDER BY check_date DESC
		LIMIT 1`

	var log domain.SilageFermentationLog
	err := r.db.QueryRow(ctx, query, conversionID).Scan(
		&log.IDLog,
		&log.IDConversion,
		&log.CheckDate,
		&log.Status,
		&log.PHLevel,
		&log.Temperature,
		&log.PhysicalCondition,
		&log.Notes,
		&log.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &log, nil
}
