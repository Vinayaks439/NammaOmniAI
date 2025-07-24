package config

import (
	"github.com/spf13/viper"
)

// SummaryConfig holds configurable values for the summarizer service.
type SummaryConfig struct {
	Prompt                string   `mapstructure:"prompt"`
	Model                 string   `mapstructure:"model"`
	PubsubSubscriptionIds []string `mapstructure:"pubsub_subscription_ids"`
}

// Load reads configuration from config.{yaml|json|toml} or environment variables.
// Environment variables are prefixed with SUMMARY_ (e.g. SUMMARY_PROMPT).
// File locations searched: ./config/ and project root.
func Load() (*SummaryConfig, error) {
	v := viper.New()

	v.SetConfigName("config") // looks for config.yaml|json|toml
	v.AddConfigPath("./config")
	v.AddConfigPath(".")

	v.SetConfigType("yaml") // default type if file provided

	v.SetEnvPrefix("SUMMARY")
	v.AutomaticEnv()

	// Defaults
	v.SetDefault("prompt", "Summarise the following data in one sentence:")
	v.SetDefault("model", "gemini-2.5-flash")
	v.SetDefault("pubsub_subscription_ids", []string{"energy-management-data-sub", "traffic-update-data-sub"})

	// Read file if available
	_ = v.ReadInConfig() // ignore file-not-found, still allow env-only

	var cfg SummaryConfig
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}
