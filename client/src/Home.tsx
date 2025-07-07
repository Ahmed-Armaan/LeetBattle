import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router';
import './tailwind.css'

interface PostData {
  csrftoken: string;
  leetcodesession: string;
}

interface CookieData {
  leetcodeData: PostData;
  username: string;
}

function Home() {
  const csrfToken = useRef<HTMLInputElement>(null);
  const leetcodeSession = useRef<HTMLInputElement>(null);
  const [invalidInput, enableInvalidInput] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const data = sessionStorage.getItem("leetcode-data");
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed?.leetcodeData?.csrftoken && parsed?.leetcodeData?.leetcodesession && parsed?.username) {
          navigate("/rooms");
        }
      }
    }
    catch {
      console.log("Error: sessionCookie unavailabele or wrong structure");
    }
  }, [])

  const fetchUser = async () => {
    if (!csrfToken.current || !leetcodeSession.current) {
      console.log("Data not provided");
      return;
    }

    const postData: PostData = {
      csrftoken: csrfToken.current.value,
      leetcodesession: leetcodeSession.current.value,
    }

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`user fetch error: ${response.status}`);
      }

      const responseData = await response.json();
      const jsonData = JSON.parse(responseData.username);
      const username = jsonData.data.user.username;

      const cookieData: CookieData = {
        leetcodeData: postData,
        username: username,
      }
      sessionStorage.setItem("leetcode-data", JSON.stringify(cookieData))

      navigate("/rooms")
    }
    catch (error: any) {
      enableInvalidInput(true);
      csrfToken.current.value = "";
      leetcodeSession.current.value = "";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">LeetBattle</h1>
        <p className="text-sm text-gray-400 text-center">
          Login using your CSRF token and LeetCode session
        </p>

        {invalidInput &&
          <p className="text-sm font-bold text-center text-red-500">
            Invalid data provided
          </p>
        }

        <input
          type="text"
          placeholder="CSRF Token"
          ref={csrfToken}
          className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="LeetCode Session"
          ref={leetcodeSession}
          className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={fetchUser}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default Home
