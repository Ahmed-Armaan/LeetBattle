import { useLocation } from "react-router-dom";
import { useWs } from "./context/wsContext";
import { UseProblem } from "./context/problemContext";
import { WsActions, makeWsActionReq } from "./utils/wsActionReq";
import { useEffect, useRef } from "react";
import { type CodeSnippet } from "./lobby";
import Navbar from "./navbar";
import Monaco from "./editor";

function PlayGround() {
  const location = useLocation();
  const { wsContextVal } = useWs();
  const { title, description } = UseProblem();
  const ss = sessionStorage.getItem("roomData");
  const contentRef = useRef<HTMLDivElement>(null);

  const boilerplates = new Map<string, string>();
  const langs: string[] = ["cpp", "java", "c", "python", "golang", "rust", "javascript", "typescript"];

  const state = location.state as {
    title: string;
    content: string;
    codeSnippets: CodeSnippet[];
  };

  useEffect(() => {
    if (contentRef.current !== null) {
      contentRef.current.innerHTML = state.content;
    }
  }, [state.content])

  useEffect(() => {
    state.codeSnippets.map((snippet) => {
      if (langs.includes(snippet.langSlug)) {
        boilerplates.set(snippet.langSlug, snippet.code);
      }
    })
  }, [state.codeSnippets])

  return (
    <>
      <Navbar />

      <div className="flex-1 bg-black flex flex-row p-2">
        <div className="bg-gray-800 text-white p-4 rounded-md shadow-md w-1/2 m-2 overflow-y-auto max-h-[90vh]">
          <div className="text-lg font-bold">{state.title}</div>
          <div ref={contentRef}></div>
        </div>

        <div className="rounded-md shadow-md w-1/2 m-2">
          <Monaco boilerplate={boilerplates} />
        </div>

      </div >
    </>
  );
}

export default PlayGround;
