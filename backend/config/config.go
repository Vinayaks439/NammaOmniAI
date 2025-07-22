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

	v.SetConfigName("prompt") // looks for prompt.yaml|json|toml
	// Look for the file in the current directory as well as the backend folder so it works
	// whether the binary is started from the repository root (e.g. `go run ./backend/cmd`)
	// or from within the backend directory itself.
	v.AddConfigPath(".")         // current working directory
	v.AddConfigPath("./backend") // repository-root relative
	v.AddConfigPath("./config")  // optional dedicated config folder
	v.AddConfigPath("..")        // parent directory when running from backend/cmd

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
