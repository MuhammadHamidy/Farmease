package domain

import (
	"context"
	"time"
)

type Role struct {
	IDRole      int       `json:"id_role" db:"id_role"`
	RoleName    string    `json:"role_name" db:"role_name"`
	Permissions string    `json:"permissions" db:"permissions"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type Account struct {
	IDAccount        int       `json:"id_account" db:"id_account"`
	Username         string    `json:"username" db:"username"`
	Password         string    `json:"password" db:"password"`
	OperatorCategory string    `json:"operator_category" db:"operator_category"`
	IDRole           int       `json:"id_role" db:"id_role"`
	Role             *Role     `json:"role,omitempty" db:"-"`
	FarmID           *string   `json:"farm_id,omitempty" db:"farm_id"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	Account   *Account  `json:"account"`
}

type AuthRepository interface {
	FindByUsername(ctx context.Context, username string) (*Account, error)
	FindAccountByID(ctx context.Context, id int) (*Account, error)
	FindAllAccounts(ctx context.Context) ([]*Account, error)
	StoreAccount(ctx context.Context, account *Account) error
	FindAllRole(ctx context.Context) ([]*Role, error)
	FindRoleByID(ctx context.Context, id int) (*Role, error)
}

type UseCase interface {
	Login(ctx context.Context, req LoginRequest) (*LoginResponse, error)
	LoginOperator(ctx context.Context, username string) (*LoginResponse, error)
	GetAccountList(ctx context.Context) ([]*Account, error)
	CreateAccount(ctx context.Context, account *Account) error
	GetRoleList(ctx context.Context) ([]*Role, error)
}
