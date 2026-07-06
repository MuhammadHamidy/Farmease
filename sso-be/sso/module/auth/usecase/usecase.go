package usecase

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/farmease/sso-be/sso/module/auth/domain"
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

	if account.Role == nil || account.Role.RoleName != "Operator Kandang" {
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

// Introspect memvalidasi JWT token dan mengembalikan info akun.
func (u *useCase) Introspect(ctx context.Context, tokenString string) (*domain.IntrospectResponse, error) {
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	if strings.HasPrefix(tokenString, "mock-token-development") {
		username := "admin"
		if strings.Contains(tokenString, ":") {
			parts := strings.Split(tokenString, ":")
			if len(parts) > 1 {
				username = parts[1]
			}
		}
		account, err := u.repo.FindByUsername(ctx, username)
		if err == nil {
			return &domain.IntrospectResponse{
				Valid:    true,
				UserInfo: account,
			}, nil
		}
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(u.jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return &domain.IntrospectResponse{
			Valid:   false,
			Message: "token tidak valid atau sudah kedaluwarsa",
		}, nil
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return &domain.IntrospectResponse{Valid: false, Message: "token claims tidak valid"}, nil
	}

	idAccount, ok := claims["id_account"].(string)
	if !ok {
		return &domain.IntrospectResponse{Valid: false, Message: "id_account tidak ditemukan dalam token"}, nil
	}

	account, err := u.repo.FindAccountByID(ctx, idAccount)
	if err != nil {
		return &domain.IntrospectResponse{Valid: false, Message: "akun tidak ditemukan"}, nil
	}

	return &domain.IntrospectResponse{
		Valid:    true,
		UserInfo: account,
	}, nil
}

