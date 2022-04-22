import { Route } from "react-router-dom";
import "./App.css";
import Verify from "./components/Authentication/Verify";
import ChatPage from "./Pages/ChatPage";
import Homepage from "./Pages/Homepage";

function App() {
  return (
    <div className="App">
      <Route exact path="/" component={Homepage} />
      <Route path="/chats" component={ChatPage} />
      <Route exact path="/verify" component={Verify} />
    </div>
  );
}

export default App;
