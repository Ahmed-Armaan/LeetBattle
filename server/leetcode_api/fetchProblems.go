package leetcodeapi

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
)

type Problems struct {
	ProblemSlug [5]string `json:"problemSlug"`
}

type GraphQLRequest struct {
	Query     string         `json:"query"`
	Variables map[string]any `json:"variables"`
}

type GraphQLResponse struct {
	Data struct {
		ProblemsetQuestionList struct {
			Total     int `json:"total"`
			Questions []struct {
				TitleSlug  string `json:"titleSlug"`
				IsPaidOnly bool   `json:"isPaidOnly"`
			} `json:"questions"`
		} `json:"problemsetQuestionList"`
	} `json:"data"`
}

var Difficulty = [3]string{"EASY", "MEDIUM", "HARD"}

// GraphQL query string
const query = `
query getProblems($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
  ) {
    total: totalNum
    questions: data {
      titleSlug
      isPaidOnly
    }
  }
}
`

func FetchProblems(diff int) (string, error) {
	lcResp, err := lcFetchRequest(Difficulty[diff], 0)
	if err != nil {
		return "", errors.New("Cound not fetch problems")
	}

	total := lcResp.Data.ProblemsetQuestionList.Total
	if total == 0 {
		fmt.Println("TOtal 0 LOL")
		return "", errors.New("Cound not fetch problems")
	}
	var problems Problems

	for i := 0; i < 5; {
		random := rand.Intn(total)
		lcResp, err = lcFetchRequest(Difficulty[diff], random)
		if err != nil {
			return "", errors.New("Cound not fetch problems")
		}

		if lcResp.Data.ProblemsetQuestionList.Questions[0].IsPaidOnly {
			continue
		} else {
			problems.ProblemSlug[i] = lcResp.Data.ProblemsetQuestionList.Questions[0].TitleSlug
			i++
		}
	}

	jsonData, err := json.Marshal(problems)
	if err != nil {
		return "", errors.New("Cound not Marshal jsonData")
	}

	return string(jsonData), nil
}

func lcFetchRequest(diff string, skip int) (*GraphQLResponse, error) {
	reqBody := GraphQLRequest{
		Query: query,
		Variables: map[string]any{
			"categorySlug": "",
			"limit":        1,
			"skip":         skip,
			"filters": map[string]any{
				"difficulty": diff,
			},
		},
	}

	jsonBody, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", "https://leetcode.com/graphql", bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Referer", "https://leetcode.com")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var lcResp GraphQLResponse
	err = json.NewDecoder(resp.Body).Decode(&lcResp)
	if err != nil {
		return nil, err
	}

	return &lcResp, nil
}
