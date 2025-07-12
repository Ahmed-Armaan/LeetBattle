import { useEffect, useState } from 'react';

const Navbar = () => {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [username, setUserName] = useState("");
  const [optionsState, toggleOptions] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("leetcode-data");
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed?.userImage) {
        setImageURL(parsed.userImage);
        setUserName(parsed.username);
      }
    }
  }, []);

  return (
    <div className="bg-gray-900 text-white px-6 py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xl font-bold">Leetbattle</div>
        <div className="relative">
          {imageURL && (
            <img
              src={imageURL}
              title={username}
              className="w-10 h-10 rounded-full border-2 border-white cursor-pointer"
              onClick={() => toggleOptions(!optionsState)}
              alt={`${username}'s avatar`}
            />
          )}

          {optionsState && (
            <div className="absolute right-0 mt-2 z-10 rounded-md bg-gray-700 shadow-lg ring-1 ring-black/5">
              <ul className="py-1">
                <li className="px-4 py-2 hover:bg-gray-500 cursor-pointer">History</li>
                <li className="px-4 py-2 hover:bg-gray-500 cursor-pointer">LogOut</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
