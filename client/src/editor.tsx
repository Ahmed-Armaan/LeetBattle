import { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import Notification from "./notification";

function Monaco({ boilerplate }: { boilerplate: Map<string, string> }) {
  const [currLanguage, setLanguage] = useState("cpp");
  const [currBoilerplate, setBoilerplate] = useState(boilerplate.get("cpp"));
  const [showNotification, toggleNotification] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");

  useEffect(() => {
    let newBoilerplate: string | undefined = boilerplate.get(currLanguage);
    if (newBoilerplate === undefined) {
      setNotifMessage(`The problem is not available in ${currLanguage}`);
      toggleNotification(true);
      setTimeout(() => toggleNotification(false), 2000);
    }
    else {
      setBoilerplate(boilerplate.get(currLanguage));
    }
  }, [currLanguage, boilerplate]);

  return (
    <div className="rounded-lg overflow-hidden">
      {showNotification && <Notification message={notifMessage} />}

      <div style={{ padding: "10px", background: "#1e1e1e", color: "white" }}>
        <label>
          Language:{" "}
          <select className="bg-blue-900"
            value={currLanguage}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="python">Python</option>
            <option value="golang">Go</option>
            <option value="rust">Rust</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
          </select>
        </label>
      </div>

      <Editor
        height="85vh"
        language={currLanguage}
        value={currBoilerplate}
        theme="vs-dark"
      />
    </div>
  );
}

export default Monaco;
