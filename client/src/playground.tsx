import { useLocation } from "react-router-dom";
import { useWs } from "./context/wsContext";
import { UseProblem } from "./context/problemContext";
import { WsActions, makeWsActionReq } from "./utils/wsActionReq";
import React, { useEffect, useRef, useState } from "react";
import { type CodeSnippet, type ProblemContentRes } from "./lobby";
import type { PostData } from "./home";
import Navbar from "./navbar";
import Monaco from "./editor";
import type * as monaco from "monaco-editor";
import { NavLink } from "react-router-dom";

interface SubmissionReq {
  slug: string;
  questionId: string;
  lang: string;
  code: string;
  cookies: PostData;
}

interface SubmitRes {
  state: string;
  status_msg: string;
  status_code: number;
  lang: string;
  run_success: boolean;
  compile_error: string;
  full_compile_error: string;
  status_runtime: string;
  memory: number;
  question_id: string;
  task_finish_time: number;
  task_name: string;
  finished: boolean;
  total_correct?: number | null;
  total_testcases?: number | null;
  runtime_percentile?: number | null;
  status_memory: string;
  memory_percentile?: number | null;
  pretty_lang: string;
  submission_id: string;
  code_output: string;
  last_testcase: string;
  expected_output: string;
  full_runtime_error: string;
}

function handleSubmitRes(resp: SubmitRes): string {
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
    case "Compile Error":
    case "Runtime Error":
      status += `Last Testcase: ${resp.last_testcase}<br/>`;
      status += `Code Output: ${resp.code_output}<br/>`;
      status += `Expected Output: ${resp.expected_output}<br/>`;
  }

  return status;
}

function PlayGround() {
  const location = useLocation();
  const { wsContextVal } = useWs();
  const { title, description } = UseProblem();
  const ss = sessionStorage.getItem("roomData");
  const contentRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [boilerplate, setBoilerplate] = useState<Map<string, string>>(new Map());
  const [currLanguage, setLanguage] = useState("cpp");
  const msgRef = useRef<HTMLDivElement>(null);
  const [showMsg, toggleMsg] = useState(false);
  const langs: string[] = ["cpp", "java", "c", "python", "golang", "rust", "javascript", "typescript"];
  const state = location.state as ProblemContentRes & {
    slug: string;
  };

  useEffect(() => {
    if (contentRef.current !== null) {
      contentRef.current.innerHTML = state.content;
    }
  }, [state.content])

  useEffect(() => {
    const newMap = new Map<string, string>();
    state.codeSnippets.forEach((snippet) => {
      if (langs.includes(snippet.langSlug)) {
        newMap.set(snippet.langSlug, snippet.code);
      }
    });

    setBoilerplate(newMap);
  }, [state.codeSnippets]);

  const makeSubmission = async () => {
    const ss = sessionStorage.getItem("leetcode-data");
    if (editorRef.current?.getValue() && ss) {
      var submissionReq: SubmissionReq = {
        slug: state.slug,
        questionId: state.QuestionId,
        lang: currLanguage,
        code: editorRef.current?.getValue(),
        cookies: JSON.parse(ss).leetcodeData,
      }

      await fetch("http://localhost:8080/submit", {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(submissionReq),
      })
        .then((res) => res.json())
        .then((jsonRes: SubmitRes) => {
          if (msgRef.current)
            msgRef.current.innerHTML = handleSubmitRes(jsonRes);
        })
        .catch((err) => console.log(err));
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex p-2 bg-black gap-2">

        {/* Left Div */}
        <div className="bg-gray-800 text-white rounded-md shadow-md w-1/2 flex flex-col max-h-[91vh]">

          <div className="p-4 border-b-2 border-gray-600 overflow-y-auto flex-1">
            <div className="text-lg font-bold mb-2">{state.title}</div>
            <div ref={contentRef}></div>
          </div>

          <div className="bg-gray-900">
            <div className="p-4 flex justify-end gap-3">
              <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 h-10"
                onClick={() => {
                  makeSubmission();
                }}
              >Submit</button>
              {/*<button className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 h-10">Run</button>*/}
              <button className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 h-10">Forfeit</button>
              <button className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 h-10"
                onClick={() => toggleMsg(!showMsg)}
              >Show Last Message</button>
            </div>
            {showMsg &&
              <div ref={msgRef}></div>
            }
          </div>

        </div>

        {/* Right Div */}
        <div className="bg-gray-700 rounded-md shadow-md w-1/2 flex flex-col h-[91vh]">
          <div className="flex-1 p-2">
            <Monaco boilerplate={boilerplate} editorRef={editorRef} currLanguage={currLanguage} setLanguage={setLanguage} />
          </div>
        </div>

      </div>
    </>
  );
}

export default PlayGround;
