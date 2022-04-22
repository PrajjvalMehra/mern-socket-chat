const mongoose = require("mongoose");

const tokenModel = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    token: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Token = mongoose.model("Token", tokenModel);

module.exports = Token;
