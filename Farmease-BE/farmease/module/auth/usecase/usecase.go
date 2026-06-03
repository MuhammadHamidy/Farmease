package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/auth/domain"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type useCase struct {
	repo      domain.AuthRepository
	jwtSecret string
}

func NewUseCase(repo domain.AuthRepository, jwtSecret string) domain.UseCase {
	return &useCase{
		repo:      repo,
		jwtSecret: jwtSecret,
	}
}

func (u *useCase) Login(ctx context.Context, req domain.LoginRequest) (*domain.LoginResponse, error) {
	account, err := u.repo.FindByUsername(ctx, req.Username)
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	err = bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(req.Password))
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	expiresAt := time.Now().Add(24 * time.Hour)
	claims := jwt.MapClaims{
		"id_account": account.IDAccount,
		"exp":        expiresAt.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(u.jwtSecret))
	if err != nil {
		return nil, err
	}

	return &domain.LoginResponse{
		Token:     tokenString,
		ExpiresAt: expiresAt,
		Account:   account,
	}, nil
}

func (u *useCase) LoginOperator(ctx context.Context, username string) (*domain.LoginResponse, error) {
	account, err := u.repo.FindByUsername(ctx, username)
	if err != nil {
		return nil, errors.New("operator ID not found")
	}

	if account.OperatorCategory != "Operator Ternak" {
		return nil, errors.New("only Livestock Operator can login without password")
	}

	expiresAt := time.Now().Add(24 * time.Hour)
	claims := jwt.MapClaims{
		"id_account": account.IDAccount,
		"exp":        expiresAt.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(u.jwtSecret))
	if err != nil {
		return nil, err
	}

	return &domain.LoginResponse{
		Token:     tokenString,
		ExpiresAt: expiresAt,
		Account:   account,
	}, nil
}

func (u *useCase) GetAccountList(ctx context.Context) ([]*domain.Account, error) {
	return u.repo.FindAllAccounts(ctx)
}

func (u *useCase) CreateAccount(ctx context.Context, account *domain.Account) error {
	if account.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(account.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		account.Password = string(hashedPassword)
	}
	return u.repo.StoreAccount(ctx, account)
}

func (u *useCase) GetRoleList(ctx context.Context) ([]*domain.Role, error) {
	return u.repo.FindAllRole(ctx)
}
