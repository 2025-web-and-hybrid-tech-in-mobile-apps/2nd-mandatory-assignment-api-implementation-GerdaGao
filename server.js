const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//
// Mock database
const users = []; // { username, passwordHash }
const highScores = []; // { username, score }

const SECRET_KEY = "secret_key"; // Change this for production
// Your solution should be written here
// Signup route
// Signup route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Username and password are required" });
  }
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash });
  res.status(201).json({ message: "User registered successfully" });
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Username and password are required" });
  }
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid username or password" });
  }
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

// Middleware for authentication
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = decoded;
      next();
  });
}

// High score route
app.post("/hiscore", authenticate, (req, res) => {
  const { score } = req.body;
  if (typeof score !== "number" || score < 0) {
      return res.status(400).json({ error: "Invalid score" });
  }
  highScores.push({ username: req.user.username, score });
  res.status(201).json({ message: "High score submitted successfully" });
});

// Get high scores
app.get("/hiscores", authenticate, (req, res) => {
  const sortedScores = highScores.sort((a, b) => b.score - a.score);
  res.json(sortedScores);
});
//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
  app 
};
