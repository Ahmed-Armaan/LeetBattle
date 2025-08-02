import "./tailwind.css";

function TeamCard({ team }: { team: string[] | undefined }) {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-md shadow-md w-1/2 m-2">
      <ul>
        {team?.map((player, idx) => (
          <li key={idx} className="text-2xl py-1 px-2 my-2 mx-2 border border-white rounded-md">
            {player}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeamCard;
