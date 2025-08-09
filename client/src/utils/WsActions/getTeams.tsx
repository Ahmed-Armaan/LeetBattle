import { useEffect } from "react";
import { UseTeams } from "../../context/teamContext";

interface Teams {
	team1: string[],
	team2: string[],
}

function GetTeams(msg: string) {
	const { setteam1context, setteam2context } = UseTeams();

	useEffect(() => {
		var teams: Teams = JSON.parse(msg);
		setteam1context(teams.team1);
		setteam2context(teams.team2);
	}, [msg])

	return null;
}

export default GetTeams;
