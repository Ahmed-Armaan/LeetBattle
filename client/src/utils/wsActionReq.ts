// ws requires a {action, roomId, payload} to interract
export interface WsActionsReq {
	action: string,
	roomid: string,
	payload: string,
}

const WsActions = {
	JoinNotify: "join_notify",
	StartGame: "start_game",
	SendSolution: "send_solution",
	Forfiet: "forfiet",
	Starting: "starting",
	SetTimer: "set_timer",
	SwitchTeam: "switch_team",
	Exit: "exit_room",
	TimeUp: "time_up",
	Error: "error",
	Test: "test",
}

function makeWsActionReq(action: string, roomid: string, payload: string, ws: WebSocket | null) {
	if (ws === null) {
		console.log("wsNull");
		return;
	}

	console.log("making req");
	const wsActionReq: WsActionsReq = {
		action: action,
		roomid: roomid,
		payload: payload,
	}
	ws.send(JSON.stringify(wsActionReq));
}

export { makeWsActionReq, WsActions };
