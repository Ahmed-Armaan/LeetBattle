import { useLocation } from "react-router-dom";
import { useWs } from "./context/wsContext";
import { WsContextProvider } from "./context/wsContext";
//import { UseProblem } from "./context/problemContext";
import { WsActions, makeWsActionReq } from "./utils/wsActionReq";
import React, { use, useEffect, useRef, useState } from "react";
import { UseTeams } from "./context/teamContext";
import { UseTimer } from "./context/TimerContext";
import { UseGameState } from "./context/GameState";
import { TeamContextProvider } from "./context/teamContext";
import { type CodeSnippet, type ProblemContentRes } from "./lobby";
import type { PostData } from "./home";
import Navbar from "./navbar";
import Monaco from "./editor";
import Timer from "./timer";
import type * as monaco from "monaco-editor";
import { handleSubmitRes } from "./utils/submitResHandler";
import EndScreen from "./gameEndScreen";
import { NavLink } from "react-router-dom";

interface SubmissionReq {
  slug: string;
  questionId: string;
  lang: string;
  code: string;
  cookies: PostData;
}

export interface SubmitRes {
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

function PlayGround() {
  const location = useLocation();
  const { wsContextVal } = useWs();
  //  const { title, description } = UseProblem();
  const ss = sessionStorage.getItem("roomData");
  const contentRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [boilerplate, setBoilerplate] = useState<Map<string, string>>(new Map());
  const msgRef = useRef<HTMLDivElement>(null);
  const [currLanguage, setLanguage] = useState("cpp");
  const [gameTimerup, toggleGameTimeState] = useState(false);
  const [msgValue, setMsgValue] = useState<number>(0);
  const [showMsg, toggleMsg] = useState(false);
  const [accepted, setaccepted] = useState(false);
  const { team1, team2, team1ScoresLeft, team2ScoresLeft, setTeam1Scores, setTeam2Scores } = UseTeams();
  const { running, setRunning, winningTeam, setWinningTeam } = UseGameState();
  const { time, setTime } = UseTimer();

  const langs: string[] = ["cpp", "java", "c", "python", "golang", "rust", "javascript", "typescript"];
  const state = location.state as ProblemContentRes & {
    slug: string;
  };

  useEffect(() => {
    if (wsContextVal === null)
      console.log("ws unavailable")
  }, [wsContextVal])

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

  useEffect(() => {
    if (team1ScoresLeft === 0) {
      console.log(`team 1 won`);
      setRunning(false);
      setMsgValue(1);
    } else if (team2ScoresLeft === 0) {
      console.log(`team 2 won`);
      setRunning(false);
      setMsgValue(2);
    }
  }, [team1ScoresLeft, team2ScoresLeft, setRunning]);

  useEffect(() => {
    if (gameTimerup) {
      if (ss) {
        var roomId = JSON.parse(ss).roomId;
        makeWsActionReq(WsActions.TimeUp, roomId, "ACCEPTED", wsContextVal);
      }
      setRunning(false);
      setMsgValue(3);
    }
  }, [gameTimerup])

  const makeSubmission = async () => {
    var ss = sessionStorage.getItem("leetcode-data");
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
          if (msgRef.current) {
            var msg: string = handleSubmitRes(jsonRes);
            msgRef.current.innerHTML = msg;
            toggleMsg(true);

            if (jsonRes.status_code === 10) {
              ss = sessionStorage.getItem("roomData");
              if (ss) {
                var roomId = JSON.parse(ss).roomId;
                makeWsActionReq(WsActions.SendSolution, roomId, "ACCEPTED", wsContextVal);
                setaccepted(true);
              }
            }
          }
        })
        .catch((err) => console.log(err));
    }
  }

  return (
    <>
      {accepted && msgValue === 0 && <EndScreen msgCode={0} />}
      {msgValue !== 0 && <EndScreen msgCode={msgValue} />}
      <Navbar />
      <div className="flex p-2 bg-black gap-2">

        {/* Left Div */}
        <div className="bg-gray-800 text-white rounded-md shadow-md w-1/2 flex flex-col max-h-[91vh]">

          <div className="p-4 border-b-2 border-gray-600 overflow-y-auto flex-1">
            <div className="text-lg font-bold mb-2">{state.title}</div>
            <div ref={contentRef}></div>
          </div>

          <div className="bg-gray-900 p-4">

            <div className="flex justify-between items-start">
              <div className="flex flex-col space-y-2">
                <div>
                  <span>
                    Problems Remaining:{" "}
                    <span className="number-box">{team1ScoresLeft}</span> :
                    <span className="number-box">{team2ScoresLeft}</span>
                  </span>
                </div>
                <div>
                  <span>
                    Time Remaining:{" "}
                    <Timer
                      time={time}
                      toggleGameTimeState={toggleGameTimeState}
                    />
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2 w-40">
                <button
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 h-10 w-full"
                  onClick={() => makeSubmission()}
                >
                  Submit
                </button>
                <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 h-10 w-full"
                  onClick={() => toggleMsg(!showMsg)}
                >
                  Last message
                </button>
              </div>
            </div>

            <div
              ref={msgRef}
              className={`${showMsg ? "block" : "hidden"} text-sm text-yellow-300 whitespace-pre-wrap mt-4`}
            />
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
