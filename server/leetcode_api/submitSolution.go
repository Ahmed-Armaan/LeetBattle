package leetcodeapi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type SubmissionData struct {
	Slug       string  `json:"slug"`
	QuestionId string  `json:"questionId"`
	Lang       string  `json:"lang"`
	Code       string  `json:"code"`
	Cookies    Cookies `json:"cookies"`
}

type SubmissionReq struct {
	Lang       string `json:"lang"`
	TypedCode  string `json:"typed_code"`
	QuestionId string `json:"question_id"`
}

type SubmissionRes struct {
	SubmissionId int `json:"submission_id"`
}

type PollRes struct {
	State             string   `json:"state"`
	StatusMsg         string   `json:"status_msg"`
	StatusCode        int      `json:"status_code"`
	Lang              string   `json:"lang"`
	RunSuccess        bool     `json:"run_success"`
	CompileError      string   `json:"compile_error"`
	FullCompileError  string   `json:"full_compile_error"`
	StatusRuntime     string   `json:"status_runtime"`
	Memory            int      `json:"memory"`
	QuestionID        string   `json:"question_id"`
	TaskFinishTime    int64    `json:"task_finish_time"`
	TaskName          string   `json:"task_name"`
	Finished          bool     `json:"finished"`
	TotalCorrect      *int     `json:"total_correct"`
	TotalTestcases    *int     `json:"total_testcases"`
	RuntimePercentile *float64 `json:"runtime_percentile"`
	StatusMemory      string   `json:"status_memory"`
	MemoryPercentile  *float64 `json:"memory_percentile"`
	PrettyLang        string   `json:"pretty_lang"`
	SubmissionID      string   `json:"submission_id"`
	CodeOutput        string   `json:"code_output"`
	LastTestcase      string   `json:"last_testcase"`
	ExpectedOutput    string   `json:"expected_output"`
	RuntimeError      string   `json:"full_runtime_error"`
}

func getSubmissionId(data SubmissionData, userAgent string) (int, error) {
	url := fmt.Sprintf("https://leetcode.com/problems/%s/submit/", data.Slug)
	payload := SubmissionReq{
		Lang:       data.Lang,
		TypedCode:  data.Code,
		QuestionId: data.QuestionId,
	}
	jsonData, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return -1, err
	}
	req.Header = buildHeader(&data.Cookies, userAgent, url)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return -1, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return -1, err
	}
	var submitRes SubmissionRes
	json.Unmarshal(body, &submitRes)

	return submitRes.SubmissionId, nil
}

func pollSubmissionResult(submissionId string, cookies Cookies, userAgent string) (PollRes, error) {
	url := fmt.Sprintf("https://leetcode.com/submissions/detail/%s/check/", submissionId)
	client := &http.Client{}

	for {
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return PollRes{}, err
		}

		headers := http.Header{}
		headers.Set("x-csrftoken", cookies.CsrfToken)
		headers.Set("Cookie", fmt.Sprintf("LEETCODE_SESSION=%s; csrftoken=%s", cookies.LeetcodeSession, cookies.CsrfToken))
		headers.Set("User-Agent", userAgent)
		req.Header = headers

		resp, err := client.Do(req)
		if err != nil {
			return PollRes{}, err
		}
		defer resp.Body.Close()

		var pollRes PollRes
		err = json.NewDecoder(resp.Body).Decode(&pollRes)
		if err != nil {
			return PollRes{}, err
		}

		fmt.Printf("status = %s\n", pollRes.State)
		fmt.Printf("msg = %s\n", pollRes.StatusMsg)

		if pollRes.State == "SUCCESS" {
			return pollRes, nil
		}

		time.Sleep(1 * time.Second)
	}
}

func Submit(data SubmissionData, userAgent string) (PollRes, error) {
	submissionId, err := getSubmissionId(data, userAgent)
	if err != nil {
		return PollRes{}, err
	}
	fmt.Printf("submissionId = %d\n", submissionId)

	status, err := pollSubmissionResult(fmt.Sprint(submissionId), data.Cookies, userAgent)
	if err != nil {
		return PollRes{}, err
	}

	return status, nil
}
