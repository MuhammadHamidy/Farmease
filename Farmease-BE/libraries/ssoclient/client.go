package ssoclient

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

// UserInfo berisi data user yang dikembalikan oleh SSO setelah token divalidasi.
type UserInfo struct {
	IDAccount        string    `json:"id_account"`
	Username         string    `json:"username"`
	Password         string    `json:"password"`
	IDRole           string    `json:"id_role"`
	Role             *Role     `json:"role,omitempty"`
	FarmID           *string   `json:"farm_id,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// Role berisi informasi role dari SSO.
type Role struct {
	IDRole      string `json:"id_role"`
	RoleName    string `json:"role_name"`
	Permissions string `json:"permissions"`
}

// IntrospectResponse adalah wrapper respons dari endpoint /api/auth/introspect.
type IntrospectResponse struct {
	Valid    bool      `json:"valid"`
	UserInfo *UserInfo `json:"user_info,omitempty"`
	Message  string    `json:"message,omitempty"`
}

// Client adalah HTTP client untuk berkomunikasi dengan BE-SSO.
type Client struct {
	baseURL    string
	httpClient *http.Client
}

// NewClient membuat instance SSOClient baru.
// baseURL contoh: "http://localhost:8080"
func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// Introspect memvalidasi JWT token dengan memanggil BE-SSO.
// Mengembalikan UserInfo jika token valid, atau error jika tidak.
func (c *Client) Introspect(token string) (*UserInfo, error) {
	url := fmt.Sprintf("%s/api/auth/introspect", c.baseURL)

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("ssoclient: failed to create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ssoclient: failed to call SSO introspect: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("ssoclient: failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ssoclient: token invalid (status %d)", resp.StatusCode)
	}

	var result IntrospectResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("ssoclient: failed to parse response: %w", err)
	}

	if !result.Valid || result.UserInfo == nil {
		return nil, errors.New("ssoclient: token is not valid")
	}

	return result.UserInfo, nil
}
