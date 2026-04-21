const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// Default page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/todoDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Models
const User = require("./models/User");
const Todo = require("./models/Todo");

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashed
    });
    await user.save();
    res.json({ msg: "Registered Successfully" });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).json({ msg: "User not found" });

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign({ id: user._id }, "secretkey");
    res.json({ token });

  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

// AUTH
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
}

// TODOS
app.get("/api/todos", auth, async (req, res) => {
  const todos = await Todo.find({ user: req.user.id });
  res.json(todos);
});

app.post("/api/todos", auth, async (req, res) => {
  const todo = new Todo({
    task: req.body.task,
    user: req.user.id
  });
  await todo.save();
  res.json(todo);
});

app.put("/api/todos/:id", auth, async (req, res) => {
  const updated = await Todo.findByIdAndUpdate(
    req.params.id,
    { task: req.body.task },
    { new: true }
  );
  res.json(updated);
});

app.delete("/api/todos/:id", auth, async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));