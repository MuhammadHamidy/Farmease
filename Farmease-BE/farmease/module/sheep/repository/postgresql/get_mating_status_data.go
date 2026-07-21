package postgresql

import (
	"context"
	"encoding/json"
	"time"
)

// GetMatingStatusData compiles mating maps (active matings, pending submissions, and latest estrus checks) to decide breeding readiness.
func (r *Repository) GetMatingStatusData(ctx context.Context) (activeMatingFemales map[string]bool, pendingMatingSheeps map[string]bool, latestEstrusChecks map[string]string, err error) {
	activeMatingFemales = make(map[string]bool)
	pendingMatingSheeps = make(map[string]bool)
	latestEstrusChecks = make(map[string]string)

	// 1. Query active matings where status is 'proses'
	matingRows, err := r.db.Query(ctx, `SELECT id_sheep_female FROM breeding.matings WHERE status = 'proses'`)
	if err == nil {
		defer matingRows.Close()
		for matingRows.Next() {
			var femaleID string
			if errScan := matingRows.Scan(&femaleID); errScan == nil {
				activeMatingFemales[femaleID] = true
			}
		}
	}

	// 2. Query pencatatan submissions that are not rejected
	subRows, err := r.db.Query(ctx, `
		SELECT payload, submitted_at 
		FROM operations.pencatatan_submissions 
		WHERE approval_status != 'rejected'
		ORDER BY submitted_at ASC`)
	if err == nil {
		defer subRows.Close()
		
		type SubmissionItem struct {
			Name             string `json:"name"`
			TargetID         string `json:"targetId"`
			HasilPemeriksaan string `json:"hasilPemeriksaan"`
		}
		
		type PayloadData struct {
			Items []SubmissionItem `json:"items"`
		}
		
		type FullPayload struct {
			Data PayloadData `json:"data"`
		}

		for subRows.Next() {
			var payloadBytes []byte
			var submittedAt time.Time
			if errScan := subRows.Scan(&payloadBytes, &submittedAt); errScan == nil {
				// Parse possible payload shapes
				var fullPayload FullPayload
				if errUnmarshal := json.Unmarshal(payloadBytes, &fullPayload); errUnmarshal == nil {
					items := fullPayload.Data.Items
					if len(items) == 0 {
						var directPayload PayloadData
						if errDirect := json.Unmarshal(payloadBytes, &directPayload); errDirect == nil {
							items = directPayload.Items
						}
					}
					if len(items) == 0 {
						var nestedPayload struct {
							Payload FullPayload `json:"payload"`
						}
						if errNested := json.Unmarshal(payloadBytes, &nestedPayload); errNested == nil {
							items = nestedPayload.Payload.Data.Items
						}
					}
					
					for _, item := range items {
						target := item.TargetID
						if target == "" {
							continue
						}
						
						name := item.Name
						if name == "Cek Birahi" || name == "Pencatatan Birahi" || name == "Pengecekan Birahi" {
							latestEstrusChecks[target] = item.HasilPemeriksaan
						} else if name == "Kawin Alam" || name == "Kawin Alami" || name == "IB" || name == "Inseminasi Buatan" {
							pendingMatingSheeps[target] = true
						}
					}
				}
			}
		}
	}

	return activeMatingFemales, pendingMatingSheeps, latestEstrusChecks, nil
}
