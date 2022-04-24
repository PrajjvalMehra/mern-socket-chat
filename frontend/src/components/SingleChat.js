import { ArrowBackIcon, ArrowRightIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getSender, getSenderFull, includesUser } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import "./styles.css";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import socketUrl from "./../config/environment";
import socket from "../Socket";
var selectedChatCompare;

function SingleChat({ fetchAgain, setFetchAgain }) {
  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    setGlobalSocket,
    globalSocket,
  } = ChatState();
  const [chatUsers, setChatUsers] = useState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [online, setOnline] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  const set = sessionStorage.getItem("sockOn");
  console.log("ONLINE", online);
  useEffect(() => {
    if (set === "false") {
      socket.emit("setup", user);
      socket.on("connected", () => {
        console.log("USER CONNECTED");
        setSocketConnected(true);
      });
      sessionStorage.setItem("sockOn", true);
    }

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    // eslint-disable-next-line
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  console.log(online);
  const fetchMessages = async (userId, caseType) => {
    if (!selectedChat) return;

    if (
      selectedChat.users[0]._id === userId ||
      (selectedChat.users[1]._id === userId && userId)
    ) {
      return setOnline(caseType);
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      socket.emit("join chat", {
        chatId: selectedChat._id,
        users: selectedChat.users,
      });

      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  useEffect(() => {
    socket.on("userOnline", () => {
      console.log("ONLINE CALLED");
      setOnline(true);
    });
    socket.on("userOffline", (user) => {
      console.log("OFFLINE CALLED", user);
      fetchMessages(user, false);
    });
    socket.on("userReturned", (user) => {
      console.log("USER BACK ONLINE");
      fetchMessages(user, true);
    });
  });
  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      setFetchAgain(!fetchAgain);
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    setOnline(false);

    // eslint-disable-next-line
  }, [selectedChat]);
  const sendMessage = async (event) => {
    if ((event.key === "Enter" && newMessage) || event.key === undefined) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };
  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) {
      return;
    }
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 4000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                <>
                  <Text
                    width={"max-content"}
                    fontSize={{ base: "0.8em", xl: "1em" }}
                  >
                    {getSender(user, selectedChat.users)}
                  </Text>
                  {online ? (
                    <>
                      <Text
                        width={"max-content"}
                        fontSize={{ base: "15px", md: "15px" }}
                        marginRight={{ xl: "76%", sm: "none" }}
                      >
                        🟢
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text
                        width={"max-content"}
                        fontSize={{ base: "15px", md: "15px" }}
                        marginRight={{ xl: "76%", sm: "none" }}
                      >
                        🟡
                      </Text>
                    </>
                  )}
                </>
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#D4F1F4"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={60}
                    style={{ marginBottom: 0, marginLeft: 10 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <InputGroup>
                <Input
                  variant="filled"
                  bg="white"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                />
                <InputRightElement>
                  <IconButton
                    onClick={sendMessage}
                    size={"sm"}
                    color="white"
                    bgColor={"#21B6A8"}
                    aria-label="Search database"
                    icon={<ArrowRightIcon />}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize={"3xl"} pb={3}>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
}

export default SingleChat;
