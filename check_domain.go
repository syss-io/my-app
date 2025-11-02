package myapp

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"sync"

	"github.com/tmc/langchaingo/tools"
	"golang.org/x/sync/errgroup"
)

// create langchain go tool that checks if a domain is available
type CheckDomainRequest struct {
	Domain string `json:"domain"`
}

type checkResponse struct {
	Domain  string `json:"domain"`
	Zone    string `json:"zone"`
	Status  string `json:"status"`
	Summary string `json:"summary"`
}

var _ tools.Tool = &CheckDomainTool{}

type CheckDomainTool struct {
}

func (t *CheckDomainTool) Name() string {
	return "check_domain_availability"
}

func (t *CheckDomainTool) Description() string {
	return `Check if a domain names are available. Use this tool to pass a list of domain names and check if they are available.
	Example:

	Input: ["acme.com", "example.com", "test.com", ...]

	Output: [
		{
			"domain": "acme.com",
			"zone": "com",
			"status": "available",
			"summary": "The domain is available"
		},
		{
			"domain": "example.com",
			"zone": "com",
			"status": "unavailable",
			"summary": "The domain is unavailable"
		}
	`
}

func (t *CheckDomainTool) Call(ctx context.Context, input string) (string, error) {
	fmt.Println("Checking if", input, "are available")

	r := []string{}
	if err := json.Unmarshal([]byte(input), &r); err != nil {
		return "", err
	}

	g := errgroup.Group{}

	var (
		result []checkResponse
		mu     sync.Mutex
		err    error
	)

	for _, domain := range r {
		g.Go(func() error {
			r, err := checkDomain(domain)
			if err != nil {
				return err
			}
			mu.Lock()
			result = append(result, r)
			mu.Unlock()
			return err
		})
	}

	if err := g.Wait(); err != nil {
		return "", err
	}

	j, err := json.Marshal(result)
	if err != nil {
		return "", err
	}

	return string(j), nil
}

func checkDomain(domain string) (checkResponse, error) {
	url := "https://domainr.p.rapidapi.com/v2/status?mashape-key=59aaf6572cmsh516a74960baa3e8p1c2d24jsn1e91dc4f8d23&domain=" + domain

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-rapidapi-key", "59aaf6572cmsh516a74960baa3e8p1c2d24jsn1e91dc4f8d23")
	req.Header.Add("x-rapidapi-host", "domainr.p.rapidapi.com")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	type statusResponse struct {
		Status []checkResponse `json:"status"`
	}

	s := statusResponse{}
	if err := json.Unmarshal(body, &s); err != nil {
		return checkResponse{}, err
	}

	if len(s.Status) == 0 {
		return checkResponse{}, errors.New("no status found")
	}

	return s.Status[0], nil
}
