// utils/wsHandlers.ts
import { useNavigate } from "react-router";
import { WsActions } from "./wsActionReq";
import type { WsActionsReq } from "./wsActionReq";
import type { NavigateFunction } from "react-router";
import type { ProblemContentRes } from "../lobby";

interface WsHandlerDeps {
	setteam1context: (team: string[]) => void;
	setteam2context: (team: string[]) => void;
	setTeam1Scores: (score: number) => void;
	setTeam2Scores: (score: number) => void;
	toggleLoading: (b: boolean) => void;
	setTime: (time: number) => void;
	//time: number;
	currTeamsRef: React.MutableRefObject<{ team1: string[], team2: string[] }>;
	usernameRef: React.MutableRefObject<string>;
	navigate: NavigateFunction;
}

interface ProblemContentreq {
	slug: string;
}

interface Problems {
	problemSlug: string[];
	time: number;
}

export function receiveWsResFactory(deps: WsHandlerDeps) {
	return async function receiveWsRes(msg: string) {
		console.log(msg);
		const wsReq: WsActionsReq = JSON.parse(msg);

		switch (wsReq.action) {
			case WsActions.JoinNotify: {
				const teamPayload = JSON.parse(wsReq.payload);
				deps.setteam1context(teamPayload.team1 ?? []);
				deps.setteam2context(teamPayload.team2 ?? []);
				deps.setTeam1Scores(teamPayload.team1.length);
				deps.setTeam2Scores(teamPayload.team2.length);
				break;
			}

			case WsActions.Test: {
				console.log(`test message : ${wsReq.payload}`);
				break;
			}

			case WsActions.Starting: {
				deps.toggleLoading(true);
				break;
			}

			case WsActions.StartGame: {
				const problemspayload: Problems = JSON.parse(wsReq.payload);
				deps.setTime(problemspayload.time);
				console.log(problemspayload.time);

				for (let i = 0; i < 5; i++) {
					const p1 = deps.currTeamsRef.current.team1?.[i];
					const p2 = deps.currTeamsRef.current.team2?.[i];

					if (deps.usernameRef.current === p1 || deps.usernameRef.current === p2) {
						const contentReqBody: ProblemContentreq = {
							slug: problemspayload.problemSlug[i],
						};

						await fetch("http://localhost:8080/getContent", {
							method: "POST",
							body: JSON.stringify(contentReqBody),
						})
							.then(res => res.json())
							.then((jsonRes: ProblemContentRes) => {
								console.log(jsonRes);
								deps.navigate("/playground", {
									state: {
										...jsonRes,
										slug: contentReqBody.slug,
									}
								});
							})
							.catch((err) => {
								console.log(`Error: ${err}`);
							});
						return;
					}
				}
				break;
			}

			case WsActions.Exit:
				const navigate = useNavigate();
				navigate("/rooms");
				break;

			case WsActions.SetTimer:
				console.log(`Game time: ${wsReq.payload}`);
				deps.setTime(parseInt(wsReq.payload));
				break;
		}
	}
}
