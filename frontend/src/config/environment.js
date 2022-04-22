const development = false;
let socketUrl = "";
if (development === true) {
  socketUrl = "http://localhost:5000/";
} else {
  socketUrl = "https://realtime-chat-socketio-app.herokuapp.com/";
}
