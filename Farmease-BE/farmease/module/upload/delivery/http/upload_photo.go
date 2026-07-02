package http

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func (h *UploadHandler) UploadPhoto(c *fiber.Ctx) error {
	file, err := c.FormFile("photo")
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", "No photo file provided"))
	}

	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)
	
	cwd, _ := os.Getwd()
	saveDir := filepath.Join(cwd, "public", "uploads")
	if err := os.MkdirAll(saveDir, 0755); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", "Failed to create upload directory"))
	}
	
	savePath := filepath.Join(saveDir, filename)
	
	if err := c.SaveFile(file, savePath); err != nil {
		fmt.Printf("Error saving file to %s: %v\n", savePath, err)
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", "Failed to save photo: " + err.Error()))
	}

	// Return the accessible URL
	photoURL := fmt.Sprintf("/uploads/%s", filename)
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"photo_url": photoURL,
	})
}
