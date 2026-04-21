const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  task: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Todo", todoSchema);