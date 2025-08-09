package leetcodeapi

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type Question struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

type GraphQLResponseData struct {
	Question Question `json:"question"`
}

type GraphQLResponse2 struct {
	Data   GraphQLResponseData `json:"data"`
	Errors any                 `json:"errors"`
}

const query2 = `
query getQuestionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    content
  }
}`

func getContent(slug string) (Question, error) {
	requestBody := GraphQLRequest{
		Query: query2,
		Variables: map[string]any{
			"titleSlug": slug,
		},
	}
	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return Question{}, err
	}

	req, err := http.NewRequest("POST", "https://leetcode.com/graphql", bytes.NewBuffer(jsonBody))
	if err != nil {
		return Question{}, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Referer", "https://leetcode.com/problems/"+slug+"/")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return Question{}, err
	}
	defer resp.Body.Close()

	var lcResp GraphQLResponse2
	err = json.NewDecoder(resp.Body).Decode(&lcResp)
	if err != nil {
		return Question{}, err
	}

	return lcResp.Data.Question, nil
}

func FetchContent(slug string) (Question, error) {
	problemContent, err := getContent(slug)
	if err != nil {
		return Question{}, err
	}

	return problemContent, nil
}
