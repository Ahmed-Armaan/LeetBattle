package leetcodeapi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Cookies struct {
	CsrfToken       string `json:"csrftoken"`
	LeetcodeSession string `json:"leetcodesession"`
}

func GetUser(req_body io.Reader, userAgent string) (string, int) {
	var cookies Cookies
	err := json.NewDecoder(req_body).Decode(&cookies)
	if err != nil {
		return "Error: Received data invalid or faulty structure", http.StatusBadRequest
	}

	PayLoad := map[string]string{
		"query": `{ user { username } }`,
	}
	var graphqlBuf bytes.Buffer
	err = json.NewEncoder(&graphqlBuf).Encode(PayLoad)
	if err != nil {
		return "Internal Server Error: cannot marshal JSON request", http.StatusInternalServerError
	}
	headers := buildHeader(&cookies, userAgent)

	req, err := http.NewRequest("POST", "https://leetcode.com/graphql", &graphqlBuf)
	if err != nil {
		return "Internal Server Error: request cannot be created", http.StatusInternalServerError
	}
	req.Header = headers

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "Internal Server Error: Cannot reach leetcode", http.StatusInternalServerError
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "Internal Server Error: Cannot read received data", http.StatusInternalServerError
	}

	fmt.Println("Response:", string(body))
	return string(body), http.StatusOK
}

func buildHeader(cookies *Cookies, userAgnet string) http.Header {
	cookie := fmt.Sprintf("csrftoken=%s; LEETCODE_SESSION=%s", cookies.CsrfToken, cookies.LeetcodeSession)
	headers := http.Header{}
	headers.Set("content-type", "application/json")
	headers.Set("Referer", "https://leetcode.com")
	headers.Set("User-Agent", userAgnet)
	headers.Set("X-CSRFTOKEN", cookies.CsrfToken)
	headers.Set("Cookie", cookie)
	return headers
}
