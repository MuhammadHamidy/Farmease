package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/auth/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

var _ domain.AuthRepository = (*Repository)(nil)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindByUsername(ctx context.Context, username string) (*domain.Account, error) {
	query := `
		SELECT a.id_account, a.username, a.password, a.operator_category, a.id_role, a.created_at, a.updated_at,
		       r.id_role, r.role_name, r.permissions, a.farm_id
		FROM auth.accounts a
		JOIN auth.roles r ON a.id_role = r.id_role
		WHERE a.username = $1`

	var account domain.Account
	var role domain.Role
	err := r.db.QueryRow(ctx, query, username).Scan(
		&account.IDAccount, &account.Username, &account.Password, &account.OperatorCategory, &account.IDRole, &account.CreatedAt, &account.UpdatedAt,
		&role.IDRole, &role.RoleName, &role.Permissions, &account.FarmID,
	)
	if err != nil {
		return nil, err
	}
	account.Role = &role
	return &account, nil
}

func (r *Repository) FindAccountByID(ctx context.Context, id int) (*domain.Account, error) {
	query := `
		SELECT a.id_account, a.username, a.password, a.operator_category, a.id_role, a.created_at, a.updated_at,
		       r.id_role, r.role_name, r.permissions, a.farm_id
		FROM auth.accounts a
		JOIN auth.roles r ON a.id_role = r.id_role
		WHERE a.id_account = $1`

	var account domain.Account
	var role domain.Role
	err := r.db.QueryRow(ctx, query, id).Scan(
		&account.IDAccount, &account.Username, &account.Password, &account.OperatorCategory, &account.IDRole, &account.CreatedAt, &account.UpdatedAt,
		&role.IDRole, &role.RoleName, &role.Permissions, &account.FarmID,
	)
	if err != nil {
		return nil, err
	}
	account.Role = &role
	return &account, nil
}

func (r *Repository) FindAllAccounts(ctx context.Context) ([]*domain.Account, error) {
	query := `
		SELECT a.id_account, a.username, a.password, a.operator_category, a.id_role, a.created_at, a.updated_at,
		       r.id_role, r.role_name, r.permissions, a.farm_id
		FROM auth.accounts a
		JOIN auth.roles r ON a.id_role = r.id_role`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var accounts []*domain.Account
	for rows.Next() {
		var account domain.Account
		var role domain.Role
		err := rows.Scan(
			&account.IDAccount, &account.Username, &account.Password, &account.OperatorCategory, &account.IDRole, &account.CreatedAt, &account.UpdatedAt,
			&role.IDRole, &role.RoleName, &role.Permissions, &account.FarmID,
		)
		if err != nil {
			return nil, err
		}
		account.Role = &role
		accounts = append(accounts, &account)
	}
	return accounts, nil
}

func (r *Repository) StoreAccount(ctx context.Context, account *domain.Account) error {
	query := `
		INSERT INTO auth.accounts (username, password, operator_category, id_role, farm_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id_account, created_at, updated_at`

	return r.db.QueryRow(ctx, query, account.Username, account.Password, account.OperatorCategory, account.IDRole, account.FarmID).Scan(
		&account.IDAccount, &account.CreatedAt, &account.UpdatedAt,
	)
}

func (r *Repository) FindAllRole(ctx context.Context) ([]*domain.Role, error) {
	query := `SELECT id_role, role_name, permissions, created_at, updated_at FROM auth.roles`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []*domain.Role
	for rows.Next() {
		var role domain.Role
		err := rows.Scan(&role.IDRole, &role.RoleName, &role.Permissions, &role.CreatedAt, &role.UpdatedAt)
		if err != nil {
			return nil, err
		}
		roles = append(roles, &role)
	}
	return roles, nil
}

func (r *Repository) FindRoleByID(ctx context.Context, id int) (*domain.Role, error) {
	query := `SELECT id_role, role_name, permissions, created_at, updated_at FROM auth.roles WHERE id_role = $1`

	var role domain.Role
	err := r.db.QueryRow(ctx, query, id).Scan(&role.IDRole, &role.RoleName, &role.Permissions, &role.CreatedAt, &role.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &role, nil
}
