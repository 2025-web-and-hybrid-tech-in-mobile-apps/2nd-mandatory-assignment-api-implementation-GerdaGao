const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//
const SECRET_KEY = "SCK1234";
const users = {}; 
const highScores = {};
// Your solution should be written here
function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
}
// Route: Register a new user
app.post(
  "/register",
  [
    body("username").isString().trim().isLength({ min: 6 }),
    body("password").isString().isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    if (users[username]) {
      return res.status(400).json({ error: "User already exists" });
    }

    users[username] = { password }; // Storing plain password (NOT recommended in real apps)
    res.status(201).json({ message: "User registered successfully" });
  }
);


// Route: User login (JWT generation)
app.post(
  "/login",
  [
    body("username").isString().trim().notEmpty(),
    body("password").isString().isLength({ min: 6 }),
  ],
  (req, res) => {
    const { username, password } = req.body;
    if (!users[username] || users[username].password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.status(201).json({ jsonWebToken: token }); // Return the token in the response body
  }
);


// Route: Submit high score
app.post(
  "/highscores",
  [
    authenticateToken,
    body("game").isString().trim().notEmpty(),
    body("score").isInt({ min: 0 }),
  ],
  (req, res) => {
    const { game, score } = req.body;
    const username = req.user.username;

    if (!highScores[game]) {
      highScores[game] = [];
    }

    highScores[game].push({ username, score });
    highScores[game].sort((a, b) => b.score - a.score); // Sort high scores in descending order

    res.status(201).json({ message: "Score submitted", highscores: highScores[game] });
  }
);


// Route: Get high scores for a game
app.get("/highscores/:game", (req, res) => {
  const { game } = req.params;
  if (!highScores[game]) {
    return res.status(404).json({ error: "No scores for this game" });
  }
  res.json({ highscores: highScores[game] });
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
};
