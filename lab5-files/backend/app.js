require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');


const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// 1.do the db connection as done in the previous lab
const {Pool,Client } = require('pg')


//Global variable to store database credentials
let dbConfig = null;
let pool = null;

if(process.env.DB_HOST && process.env.DB_PORT && process.env.DB_NAME && process.env.DB_PASSWORD && process.env.DB_USER) {
  dbConfig = {
    host : process.env.DB_HOST,
    port : parseInt(process.env.DB_PORT),
    database : process.env.DB_NAME,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD
  };
  pool = new Pool(dbConfig);

  console.log("Database configured and a pool is created");
  if (!pool) {
    console.error("Database pool not created. Check .env variables.");
  }
}

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
  console.log("Session checking:",req.session.user);
  if(!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
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
  try {
  const {username,email,password }= req.body;

  //validating input 
  if(!username || !email || !password) {
    return res.status(400).json({
      message: "ALL fields are required"
    });
  }

  //hashing password 
  const hashedpassword = await bcrypt.hash(password,10);

  //inserting into Database 
/*
React sends signup data
        ↓
Express inserts into DB
        ↓
Postgres generates user_id
        ↓
RETURNING gives us that id
        ↓
Server sends JSON back
        ↓
React receives success response
*/
  const result = await pool.query(
    `INSERT INTO Users (username,email,password_hash) values ($1,$2,$3) returning user_id,username`,[username,email,hashedpassword]
  );

  const user = result.rows[0];

  res.status(201).json({
    user_id : user.user_id,
    username : user.username
  });
}
catch (err) {
  console.error(err);
  //23505 = unique constraint violation
  if(err.code =='23505'){
    return res.status(400).json ({
      message: "Username already exists"
    });
  }

  res.status(500).json ({
    message : "Server error"
  });

}

});

// TODO: Implement user login logic
app.post('/login', async (req, res) => {
  // TODO
  try {
    const {username,password} = req.body;

    if(!username || !password) {
      return res.status(401).json ({
        message : "Invalid Credentials"
      });
    }

    const result = await pool.query("Select user_id,username,password_hash from Users where username=$1",[username]);
    if(result.rows.length ==0) {
       return res.status(400).json ({
        message : "User Not Found"
      })
    }

    const userrow = result.rows[0];

    const match = await bcrypt.compare(password,userrow.password_hash);
    if(!match) {
      return res.status(401).json({
        message :"Invalid credentials"
      });
    }

    //store login credentials 
    req.session.user = {
      user_id : userrow.user_id,
      username : userrow.username
    }
    console.log("Session is set for : ", req.session.user);

    return res.status(200).json ({
      message:"Login successful",
      user :{
        user_id: userrow.user_id,
        username : userrow.username
      }
    })
  }
  catch(err) {
    console.error(err);
  }
});

// TODO: Check if user is logged in
app.get('/isLoggedIn', (req, res) => {
  // TODO
  if(req.session.user) {
    res.status(200).json ({
      loggedIn : true,
      user : {
        user_id : req.session.user.user_id,
        username : req.session.user.username
      }
    })
  }

  return res.status(200).json({
    loggedIn : false
  })
  
});

// TODO: Implement logout functionality
app.post('/logout', (req, res) => {
  // TODO
  req.session.destroy();
  res.status(200).json ({
    message :"Logged out"
  })
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





 