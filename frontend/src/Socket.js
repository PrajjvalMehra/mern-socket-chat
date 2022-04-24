import io from "socket.io-client";
import socketUrl from "./config/environment";
const ENDPOINT = socketUrl;
export default io(ENDPOINT);
