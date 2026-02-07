const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// do the db connection as done in the previous lab

// CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Session
app.use(session({
  secret: "expense_splitter_secret",
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
}));

// TODO: Implement authentication middleware
// Redirect unauthenticated users to the login page with respective status code
function checkAuth(req, res, next) {
  // TODO
}

// TODO: Implement balance update logic
// This function will be used to update balances 
// while adding expenses and settlements
async function updateBalance(client, payerId, debtorId, amount) {
  // TODO
}

// ---------------- AUTH ROUTES ----------------

// TODO: Implement user signup logic
// return JSON object with the following fields: {username, password, email}
// use correct status codes and messages mentioned in the lab document
app.post('/signup', async (req, res) => {
  // TODO
});

// TODO: Implement user login logic
app.post('/login', async (req, res) => {
  // TODO
});

// TODO: Check if user is logged in
app.get('/isLoggedIn', (req, res) => {
  // TODO
});

// TODO: Implement logout functionality
app.post('/logout', (req, res) => {
  // TODO
});

// ---------------- FRIENDS ROUTES ----------------

// TODO: Search users by username (excluding current user)
app.get('/users/search', checkAuth, async (req, res) => {
  // TODO
});

// TODO: Add a friend (bidirectional)
app.post('/friends/add', checkAuth, async (req, res) => {
  // TODO
});

// TODO: Fetch friend list of logged-in user
app.get('/friends', checkAuth, async (req, res) => {
  // TODO
});

// ---------------- GROUP ROUTES ----------------

// TODO: Create a new group and add members
app.post('/groups', checkAuth, async (req, res) => {
  // TODO
});

// TODO: Fetch all groups of logged-in user
app.get('/groups', checkAuth, async (req, res) => {
  // TODO
});

// TODO: Fetch group details and members
app.get('/groups/:id', checkAuth, async (req, res) => {
  // TODO
});

// ---------------- EXPENSE ROUTES ----------------

// TODO: Add an expense, splits, and update balances
app.post('/expenses', checkAuth, async (req, res) => {
  // TODO
});

// TODO: Fetch expenses of a group
app.get('/groups/:id/expenses', checkAuth, async (req, res) => {
  // TODO
});

// ---------------- SETTLEMENT ROUTES ----------------

// TODO: Settle balance between two users
app.post('/settle', checkAuth, async (req, res) => {
  // TODO
  // 1. Record settlement
  // 2. Update Balance
    // from_user (Debtor) PAYS to_user (Creditor).
    // to_user's claim on from_user REDUCES. ('amount' in updateBalance is logic for INCREASE).
    // So we pass NEGATIVE amount to updateBalance(Creditor, Debtor, -amount).

});

// TODO: Fetch balances of logged-in user
app.get('/balances', checkAuth, async (req, res) => {
  // TODO
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});





 