import { WsActions } from "../wsActionReq";
import type { WsActionsReq } from "../wsActionReq";
import GetTeams from "./getTeams";

function receiveWsRes(msg: string) {
	var wsReq: WsActionsReq = JSON.parse(msg);

	switch (wsReq.action) {
		case WsActions.JoinNotify:
			GetTeams(msg);
			break;
		case WsActions.Test:
			var Testpayload: string = wsReq.payload;
			console.log(`test message : ${Testpayload}`);
			break;
		case WsActions.StartGame:
			var Testpayload: string = wsReq.payload;
			console.log(`problem List: ${Testpayload}`);
			break;
	}

	return null;
}

export default receiveWsRes;
