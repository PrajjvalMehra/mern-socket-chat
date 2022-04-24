const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const PORT = process.env.PORT || 5000;
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const colors = require("colors");
const path = require("path");




connectDB();
const app = express();


app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
// ---------Deployment---------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// ---------Deployment---------
app.use(notFound);
app.use(errorHandler);

const server = app.listen(
  PORT,
  console.log(`Server started on port ${PORT}`.blue.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});
let users = {};
io.on("connection", (socket) => {
  console.log("connect to socket.io", users);

  socket.on("setup", (userData) => {
    console.log(io.sockets.adapter.rooms.get(socket.id));
    socket.join(userData._id);
    users[socket.id] = userData._id;
    console.log(userData._id);
    console.log("JOINED USERS", users);
    socket.emit("connected");
    socket.broadcast.emit("userReturned", userData._id);
  });
  socket.on("join chat", (chat) => {
    socket.join(chat.chatId);
    console.log("User joned room: " + chat.chatId);
    console.log(io.sockets.adapter.rooms.get(chat.chatId));
    for (let user of chat.users) {
      for (let id in users) {
        if (socket.id !== id && user._id === users[id]) {
          socket.emit("userOnline", { isOnline: true });
        }
      }
    }
  });
  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) {
      return console.log("users not found");
    }
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  socket.on("isOnline", ({ data }) => {
    if (Object.keys(users[userId]).length === 1) {
      socket.in();
    }
  });

  socket.on("disconnect", (userData) => {
    console.log("user logged out", socket.id, userData);

    socket.broadcast.emit("userOffline", users[socket.id]);
    delete users[socket.id];
    socket.leave(userData._id);

    console.log("LOGGED IN", users);
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
