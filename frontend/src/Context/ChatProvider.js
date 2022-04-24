import { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [globalSocket, setGlobalSocket] = useState("");
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const history = useHistory();
  useEffect(() => {
    setGlobalSocket(localStorage.getItem("globalSocket"));
  });
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
    console.log(window.location);
    if (!userInfo && window.location.pathname !== "/verify") history.push("/");
  }, [history]);
  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        globalSocket,
        setGlobalSocket,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
