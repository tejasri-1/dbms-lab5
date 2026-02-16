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

if (process.env.PGHOST && process.env.PGPORT && process.env.PGDATABASE &&
    process.env.PGPASSWORD && process.env.PGUSER) {
  dbConfig = {
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  };
  pool = new Pool(dbConfig);
  console.log("Database configured and a pool is created");
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
// Redirect unauthenticated users with proper status
function checkAuth(req, res, next) {
  console.log('Session checking:', req.session.user);
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
}

// Balance(user_id, other_user_id, amount):
// +ve -> other_user owes user
// -ve -> user owes other_user
async function updateBalance(client, payerId, debtorId, amount) {
  console.log('updateBalance called with', { payerId, debtorId, amount });

  // payerId has a claim of `amount` on debtorId.

  // payer's perspective
  await client.query(
    `INSERT INTO Balance (user_id, other_user_id, amount)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, other_user_id)
     DO UPDATE SET amount = Balance.amount + EXCLUDED.amount`,
    [payerId, debtorId, amount]
  );

  // debtor's opposite perspective
  await client.query(
    `INSERT INTO Balance (user_id, other_user_id, amount)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, other_user_id)
     DO UPDATE SET amount = Balance.amount + EXCLUDED.amount`,
    [debtorId, payerId, -amount]
  );
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
  try {
    const currentUserId = req.session.user.user_id;
    const q = (req.query.q || '').toString().trim();
    console.log('GET /users/search', { currentUserId, q });

    if (!q) {
      return res.json([]);
    }

    const result = await pool.query(
      `SELECT user_id, username
       FROM Users
       WHERE username ILIKE $1 AND user_id <> $2
       ORDER BY username
       LIMIT 20`,
      [`%${q}%`, currentUserId]
    );

    console.log('Search results count:', result.rowCount);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error searching users', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// TODO: Add a friend (bidirectional)
app.post('/friends/add', checkAuth, async (req, res) => {
  const currentUserId = req.session.user.user_id;
  const { friend_id } = req.body;
  console.log('POST /friends/add', { currentUserId, friend_id });

  const friendIdNum = parseInt(friend_id, 10);
  if (!friendIdNum || Number.isNaN(friendIdNum)) {
    return res.status(400).json({ message: 'Invalid friend_id' });
  }

  if (friendIdNum === currentUserId) {
    return res.status(400).json({ message: 'Cannot add yourself as friend' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure the friend user exists
    const userCheck = await client.query(
      'SELECT user_id FROM Users WHERE user_id = $1',
      [friendIdNum]
    );

    if (userCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found' });
    }

    // Insert friendship in both directions
    await client.query(
      `INSERT INTO Friend (user_id, friend_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, friend_id) DO NOTHING`,
      [currentUserId, friendIdNum]
    );

    await client.query(
      `INSERT INTO Friend (user_id, friend_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, friend_id) DO NOTHING`,
      [friendIdNum, currentUserId]
    );

    await client.query('COMMIT');
    console.log('Friendship created between', currentUserId, friendIdNum);
    return res.status(201).json({ message: 'Friend added' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding friend', err);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// TODO: Fetch friend list of logged-in user
app.get('/friends', checkAuth, async (req, res) => {
  try {
    const currentUserId = req.session.user.user_id;
    console.log('GET /friends for user', currentUserId);

    const result = await pool.query(
      `SELECT u.user_id, u.username
       FROM Friend f
       JOIN Users u ON u.user_id = f.friend_id
       WHERE f.user_id = $1
       ORDER BY u.username`,
      [currentUserId]
    );

    console.log('Friends count:', result.rowCount);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching friends', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- GROUP ROUTES ----------------

// TODO: Create a new group and add members
app.post('/groups', checkAuth, async (req, res) => {
  const currentUserId = req.session.user.user_id;
  const { name, member_ids } = req.body || {};

  const groupName = (name || '').toString().trim();
  if (!groupName) {
    return res.status(400).json({ message: 'Group name is required' });
  }

  // Normalise member IDs to integers
  const rawMembers = Array.isArray(member_ids) ? member_ids : [];
  const memberIds = rawMembers
    .map((id) => parseInt(id, 10))
    .filter((id) => !Number.isNaN(id));

  // Ensure the creator is also a member of the group
  if (!memberIds.includes(currentUserId)) {
    memberIds.push(currentUserId);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const groupRes = await client.query(
      `INSERT INTO Groups (name, created_by)
       VALUES ($1, $2)
       RETURNING group_id, name` ,
      [groupName, currentUserId]
    );

    const group = groupRes.rows[0];

    // Insert members into GroupMember
    for (const uid of memberIds) {
      await client.query(
        `INSERT INTO GroupMember (group_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (group_id, user_id) DO NOTHING`,
        [group.group_id, uid]
      );
    }

    await client.query('COMMIT');
    console.log('Group created', { group_id: group.group_id, name: group.name });
    return res.status(201).json({ group_id: group.group_id, name: group.name });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating group', err);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// TODO: Fetch all groups of logged-in user
app.get('/groups', checkAuth, async (req, res) => {
  try {
    const currentUserId = req.session.user.user_id;
    console.log('GET /groups for user', currentUserId);

    const result = await pool.query(
      `SELECT g.group_id, g.name
       FROM Groups g
       JOIN GroupMember gm ON gm.group_id = g.group_id
       WHERE gm.user_id = $1
       ORDER BY g.name`,
      [currentUserId]
    );

    console.log('Groups count:', result.rowCount);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching groups', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// TODO: Fetch group details and members
app.get('/groups/:id', checkAuth, async (req, res) => {
  const currentUserId = req.session.user.user_id;
  const groupId = parseInt(req.params.id, 10);

  if (!groupId || Number.isNaN(groupId)) {
    return res.status(400).json({ message: 'Invalid group id' });
  }

  try {
    // Fetch group
    const groupRes = await pool.query(
      `SELECT group_id, name, created_by
       FROM Groups
       WHERE group_id = $1`,
      [groupId]
    );

    if (groupRes.rowCount === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const group = groupRes.rows[0];

    // Check that current user is a member of this group
    const membershipRes = await pool.query(
      `SELECT 1
       FROM GroupMember
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, currentUserId]
    );

    if (membershipRes.rowCount === 0) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    // Fetch members
    const membersRes = await pool.query(
      `SELECT u.user_id, u.username
       FROM GroupMember gm
       JOIN Users u ON u.user_id = gm.user_id
       WHERE gm.group_id = $1
       ORDER BY u.username`,
      [groupId]
    );

    return res.status(200).json({ group, members: membersRes.rows });
  } catch (err) {
    console.error('Error fetching group details', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- EXPENSE ROUTES ----------------

// TODO: Add an expense, splits, and update balances
app.post('/expenses', checkAuth, async (req, res) => {
  const { group_id, description, amount, paid_by, splits } = req.body || {};
  const groupId = parseInt(group_id, 10);
  const paidById = parseInt(paid_by, 10);
  const totalAmount = parseFloat(amount);

  if (!groupId || Number.isNaN(groupId)) {
    return res.status(400).json({ message: 'Invalid group_id' });
  }
  if (!paidById || Number.isNaN(paidById)) {
    return res.status(400).json({ message: 'Invalid paid_by' });
  }
  if (!totalAmount || Number.isNaN(totalAmount) || totalAmount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }
  const desc = (description || '').toString().trim();
  if (!desc) {
    return res.status(400).json({ message: 'Description is required' });
  }

  if (!Array.isArray(splits) || splits.length === 0) {
    return res.status(400).json({ message: 'Splits are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert expense
    const expRes = await client.query(
      `INSERT INTO Expense (group_id, paid_by, amount, description)
       VALUES ($1, $2, $3, $4)
       RETURNING expense_id`,
      [groupId, paidById, totalAmount, desc]
    );

    const expenseId = expRes.rows[0].expense_id;

    // 2. Insert splits and update balances
    for (const s of splits) {
      const userId = parseInt(s.user_id, 10);
      const share = parseFloat(s.share_amount);

      if (!userId || Number.isNaN(userId) || !share || Number.isNaN(share) || share <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Invalid split entry' });
      }

      await client.query(
        `INSERT INTO ExpenseSplit (expense_id, user_id, share_amount)
         VALUES ($1, $2, $3)`,
        [expenseId, userId, share]
      );

      // Update balances only for users other than the payer
      if (userId !== paidById) {
        await updateBalance(client, paidById, userId, share);
      }
    }

    await client.query('COMMIT');
    console.log('Expense created', { expense_id: expenseId, group_id: groupId });
    return res.status(201).json({ expense_id: expenseId, message: 'Expense created' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating expense', err);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// TODO: Fetch expenses of a group
app.get('/groups/:id/expenses', checkAuth, async (req, res) => {
  const groupId = parseInt(req.params.id, 10);

  if (!groupId || Number.isNaN(groupId)) {
    return res.status(400).json({ message: 'Invalid group id' });
  }

  try {
    const result = await pool.query(
      `SELECT e.expense_id,
              e.description,
              e.amount,
              e.paid_by,
              u.username AS paid_by_name,
              e.created_at
       FROM Expense e
       JOIN Users u ON u.user_id = e.paid_by
       WHERE e.group_id = $1
       ORDER BY e.created_at DESC`,
      [groupId]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching group expenses', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- SETTLEMENT ROUTES ----------------

// TODO: Settle balance between two users
app.post('/settle', checkAuth, async (req, res) => {
  const fromUserId = req.session.user.user_id;
  const { to_user, amount } = req.body;
  console.log('POST /settle', { fromUserId, to_user, amount });

  const toUserId = parseInt(to_user, 10);
  const amt = parseFloat(amount);

  if (!toUserId || Number.isNaN(toUserId)) {
    return res.status(400).json({ message: 'Invalid to_user' });
  }

  if (toUserId === fromUserId) {
    return res.status(400).json({ message: 'Cannot settle with yourself' });
  }

  if (!amt || Number.isNaN(amt) || amt <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Record settlement
    await client.query(
      `INSERT INTO Settlement (from_user, to_user, amount)
       VALUES ($1, $2, $3)`,
      [fromUserId, toUserId, amt]
    );

    // 2. Update Balance
    // from_user (Debtor) PAYS to_user (Creditor).
    // Creditor's claim on debtor REDUCES by amt,
    // so pass NEGATIVE amt to updateBalance.
    await updateBalance(client, toUserId, fromUserId, -amt);

    await client.query('COMMIT');
    console.log('Settlement recorded and balances updated');
    return res.status(201).json({ message: 'Settlement recorded' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processing settlement', err);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }

});

// TODO: Fetch balances of logged-in user
app.get('/balances', checkAuth, async (req, res) => {
  try {
    const currentUserId = req.session.user.user_id;
    console.log('GET /balances for user', currentUserId);

    const result = await pool.query(
      `SELECT b.other_user_id, u.username, b.amount
       FROM Balance b
       JOIN Users u ON u.user_id = b.other_user_id
       WHERE b.user_id = $1 AND b.amount <> 0
       ORDER BY u.username`,
      [currentUserId]
    );

    console.log('Balances count:', result.rowCount);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching balances', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});





