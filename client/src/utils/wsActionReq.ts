// ws requires a {action, roomId, payload} to interract
interface WsActionsReq {
	action: string,
	roomid: string,
	payload: string,
}

const WsActions = {
	JoinNotify: "join_notify",
	StartGame: "start_game",
	SendSolution: "send_solution",
	Forfiet: "forfiet",
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

//function receiveWsRes(msg: string) {
//	var wsReq: WsActionsReq = JSON.parse(msg);
//
//	switch (wsReq.action) {
//		case WsActions.JoinNotify:
//			SetTeams({ msg: wsReq.payload });
//			break;
//		case WsActions.Test:
//			var Testpayload: string = wsReq.payload;
//			console.log(`test message : ${Testpayload}`);
//			break;
//		case WsActions.StartGame:
//			GetProblem({ msg: wsReq.payload });
//			break;
//	}
//}

export { makeWsActionReq, WsActions };
export type { WsActionsReq };
