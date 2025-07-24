package main

import (
	"backend/db"
	"context"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	ctx := context.Background()

	projectID := mustEnv("GCP_PROJECT_ID")
	dbClient, err := db.New(ctx, projectID)
	if err != nil {
		log.Fatalf("init firestore: %v", err)
	}
	defer dbClient.Close()

	r := gin.Default()
	api := r.Group("/api/v1")

	api.GET("/healthz", func(c *gin.Context) { c.String(http.StatusOK, "ok") })

	api.POST("/reports", func(c *gin.Context) {
		var req db.PotholeReport
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		id, err := dbClient.CreatePotholeReport(c, &req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"report_id": id})
	})

	api.GET("/reports/:id", func(c *gin.Context) {
		rpt, err := dbClient.GetPotholeReport(c, c.Param("id"))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, rpt)
	})

	api.GET("/reports", func(c *gin.Context) {
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
		user := c.Query("user_id")
		reports, err := dbClient.ListPotholeReports(c, limit, user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, reports)
	})

	api.PATCH("/reports/:id/resolve", func(c *gin.Context) {
		if err := dbClient.UpdateStatus(c, c.Param("id"), "resolved"); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusNoContent)
	})

	// Simple alert endpoint: “active” == not resolved yet
	api.GET("/alerts", func(c *gin.Context) {
		reports, err := dbClient.ListPotholeReports(c, 100, "")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		var active []*db.PotholeReport
		for _, r := range reports {
			if r.Status != "resolved" {
				active = append(active, r)
			}
		}
		c.JSON(http.StatusOK, active)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           r,
		ReadHeaderTimeout: 10 * time.Second,
	}
	log.Printf("🚀 REST API listening on :%s", port)
	log.Fatal(srv.ListenAndServe())
}

func mustEnv(key string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	log.Fatalf("missing required env var: %s", key)
	return ""
}
