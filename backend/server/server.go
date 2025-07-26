package server

import (
	"backend/db"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetAlerts(g *gin.RouterGroup, dbClient *db.Client) {
	g.GET("/alerts", func(c *gin.Context) {
		reports, err := dbClient.ListAlerts(c, 100, "")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Println("reports", reports)
		var active []*db.Alerts

		active = append(active, reports...)

		c.JSON(http.StatusOK, active)
	})
}

func PostAlerts(g *gin.RouterGroup, dbClient *db.Client) {
	g.POST("/alerts", func(c *gin.Context) {
		var req db.Alerts
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		log.Println("req", req)
		id, err := dbClient.CreateAlert(c, &req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"report_id": id})
	})
}

func GetAlert(g *gin.RouterGroup, dbClient *db.Client) {
	g.GET("/alerts/:id", func(c *gin.Context) {
		rpt, err := dbClient.GetAlert(c, c.Param("id"))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, rpt)
	})
}

func Healthz(g *gin.RouterGroup) {
	g.GET("/healthz", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})
}
