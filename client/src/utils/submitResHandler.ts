import type { SubmitRes } from "../playground";

export function handleSubmitRes(resp: SubmitRes): string {
	var status: string = `${resp.status_msg}<br/>`;

	switch (resp.status_msg) {
		case "Runtime Error":
			status += `Error: ${resp.full_runtime_error}<br/>`
			break;
		case "Compile Error":
			status += `Error: ${resp.full_compile_error}<br/>`
			break;
	}

	switch (resp.status_msg) {
		case "Wrong Answer":
		case "Memory Limit Exceeded":
		case "Output Limit Exceeded":
		case "Time Limit Exceeded":
		case "Runtime Error":
			status += `Last Testcase: ${resp.last_testcase}<br/>`;
			status += `Code Output: ${resp.code_output}<br/>`;
			status += `Expected Output: ${resp.expected_output}<br/>`;
	}

	return status;
}
