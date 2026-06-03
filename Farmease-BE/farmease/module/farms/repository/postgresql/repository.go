package postgresql

import (
"github.com/farmease/farmease-be/farmease/module/farms/domain"
"github.com/jackc/pgx/v5/pgxpool"
)

var _ domain.FarmRepository = (*Repository)(nil)

type Repository struct {
db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
return &Repository{db: db}
}
