package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	myapp "github.com/syss-io/my-app"
	"github.com/tmc/langchaingo/agents"
	"github.com/tmc/langchaingo/chains"
	"github.com/tmc/langchaingo/llms/googleai"
	"github.com/tmc/langchaingo/tools"
)

const prompt = `
You are a helpful assistant that analyzes startup ideas and checks if the domain is available.

### Goal

You will be given a startup idea and you will need to generate

- Generate 10 names for the startup
- Check if the domain is available for each name, loop until you find 10 available domain
- A little story behind the domain name

### Domain names

- Consider wide range of domain names, not just .com, .net, .org, etc.
- 50% of the domain names should be .com, .net, .org, etc.
- other can be experimental like .ai, .app, .fast, .work.. any available TLDs

### Tools

You can call tools using ReAct pattern

Thought: what you notice or infer
Action: describe what you check or use a tool for  
Observation: (if applicable) what you found  
Thought: conclusions from the observation  
Final Answer: When you have all the available domains, return the JSON result only and nothing else.

### Input validation

If the input is not a valid startup idea or idea is not clear, you MUST say 
{
	"error": "The input is not a valid startup idea or idea is not clear",
	"message": "Message to display to the user"
}

### Output

You MUST return the JSON result only with the following fields:

{
	"names": [
		{
			"name": "example.com",
			"domain": "example.com",
			"story": "A little story behind the domain name"
		},
		...
	]
}

NOW ANALYSE THIS:
`

type AnalyzeIdeaRequest struct {
	Idea string `json:"idea"`
}

func main() {
	mux := createMux()
	fmt.Println("Server starting on :8080...")
	http.ListenAndServe(":8080", mux)
}

// createMux sets up and returns an HTTP multiplexer with routes
func createMux() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", handleHealth)
	mux.HandleFunc("/analyze-idea", analyzeIdea)

	return mux
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "OK")
}

func analyzeIdea(w http.ResponseWriter, r *http.Request) {
	var request AnalyzeIdeaRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	llm, err := googleai.New(context.Background(), googleai.WithDefaultModel("gemini-2.5-pro"), googleai.WithAPIKey(os.Getenv("GEMINI_API_KEY")))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	ag := agents.NewConversationalAgent(llm, []tools.Tool{&myapp.CheckDomainTool{}})
	exec := agents.NewExecutor(ag, agents.WithMaxIterations(10))

	// Combine the prompt with the user's idea
	fullInput := prompt + "\n\nStartup Idea: " + request.Idea

	out, err := exec.Call(r.Context(), map[string]any{"input": fullInput}, chains.WithTemperature(1.0), chains.WithMaxTokens(30000))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if s, ok := out["output"].(string); ok {
		s = strings.ReplaceAll(s, "```json", "")
		s = strings.ReplaceAll(s, "```", "")

		fmt.Fprint(w, s)
		return // Added return to prevent falling through to error
	}

	http.Error(w, "unexpected agent output", http.StatusInternalServerError)

}
