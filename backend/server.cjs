require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const line = require('@line/bot-sdk');
const { getDbConnection } = require('./db.cjs');

// LINE Client Configuration
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || ''
};
const lineClient = new line.messagingApi.MessagingApiClient(lineConfig);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React frontend build
const path = require('path');
app.use(express.static(path.join(__dirname, '../dist')));

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-development';

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware for Admin only routes
const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    next();
  });
};

async function startServer() {
  const db = await getDbConnection();

  // --- Auth Routes ---
  // Registration is disabled for public. Admins create accounts via /api/users

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      
      if (!user) {
        return res.status(400).json({ error: 'auth/user-not-found' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: 'auth/wrong-password' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Fetch current user details via token
  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      const user = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
      if (!user) return res.sendStatus(404);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Reset employee password
  app.post('/api/users/:id/reset-password', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- API Routes ---
  app.get('/api/users', authenticateToken, async (req, res) => {
    const users = await db.all('SELECT id, name, email, role, lineUserId, phone FROM users');
    res.json(users);
  });

  app.put('/api/users/:id', authenticateToken, async (req, res) => {
    const { lineUserId, name, email, password, phone } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    
    if (lineUserId !== undefined) {
      updates.push('lineUserId = ?');
      values.push(lineUserId);
    }
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      values.push(hashedPassword);
    }
    
    if (updates.length > 0) {
      values.push(req.params.id);
      try {
        await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        res.json({ success: true });
      } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already in use.' });
        }
        res.status(500).json({ error: err.message });
      }
    } else {
      res.json({ success: true });
    }
  });

  // Admin adding an employee (creates auth account too)
  app.post('/api/users', authenticateAdmin, async (req, res) => {
    try {
      const { name, email, role, password, phone } = req.body;
      if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
        return res.status(403).json({ error: 'Unauthorized: Only admins can create accounts' });
      }
      const { name, email, role, password, phone } = req.body;
      const hashedPassword = await bcrypt.hash(password || '123456', 10);
      const id = crypto.randomUUID();

      await db.run(
        'INSERT INTO users (id, name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, email, hashedPassword, role, phone || null]
      );
      res.json({ id, name, email, role, phone });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/locations', authenticateToken, async (req, res) => {
    const locations = await db.all('SELECT * FROM locations');
    res.json(locations);
  });

  app.post('/api/locations', authenticateAdmin, async (req, res) => {
    const { name, address } = req.body;
    const id = crypto.randomUUID();
    await db.run('INSERT INTO locations (id, name, address) VALUES (?, ?, ?)', [id, name, address]);
    res.json({ id, name, address });
  });

  app.get('/api/schedules', authenticateToken, async (req, res) => {
    const schedules = await db.all('SELECT * FROM schedules');
    res.json(schedules);
  });

  app.post('/api/schedules', authenticateAdmin, async (req, res) => {
    const { userId, locationId, date, startTime, endTime, shiftType, jobDescription, notes } = req.body;
    
    // Shift Conflict Prevention
    const existingSchedules = await db.all('SELECT startTime, endTime FROM schedules WHERE userId = ? AND date = ?', [userId, date]);
    for (const shift of existingSchedules) {
      if (startTime < shift.endTime && endTime > shift.startTime) {
        return res.status(400).json({ error: 'Conflict: This employee is already scheduled during this overlapping time on this date.' });
      }
    }

    const id = crypto.randomUUID();
    await db.run(
      'INSERT INTO schedules (id, userId, locationId, date, startTime, endTime, shiftType, jobDescription, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, userId, locationId, date, startTime, endTime, shiftType, jobDescription, notes]
    );

    // Send LINE Notification
    const user = await db.get('SELECT name, lineUserId FROM users WHERE id = ?', [userId]);
    const location = await db.get('SELECT name FROM locations WHERE id = ?', [locationId]);
    if (user && user.lineUserId && lineConfig.channelAccessToken) {
      try {
        // Enforce Thailand Timezone (UTC+7) for formatting the notification
        const bkkDate = new Date(date).toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok', day: '2-digit', month: 'short', year: 'numeric' });
        await lineClient.pushMessage({
          to: user.lineUserId,
          messages: [{
            type: 'text',
            text: `Hello ${user.name}, you have a new shift assigned at ${location ? location.name : 'Unknown Location'}.\nDate: ${bkkDate}\nTime: ${startTime} - ${endTime}\nType: ${shiftType}`
          }]
        });
        console.log('LINE notification sent to', user.name);
      } catch (err) {
        console.error('Failed to send LINE message:', err.message);
      }
    } else {
      console.log(`Simulation: Would send LINE message to ${user ? user.name : userId} but no lineUserId found.`);
    }

    res.json({ id, ...req.body });
  });

  app.put('/api/schedules/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { date, startTime, endTime, shiftType, jobDescription, notes } = req.body; // Add fields as needed
    // Simple update builder for non-null fields
    const updates = [];
    const values = [];
    for (const [key, val] of Object.entries(req.body)) {
      if (val !== undefined && key !== 'id') {
        updates.push(`${key} = ?`);
        values.push(val);
      }
    }
    
    if (updates.length > 0) {
      values.push(id);
      await db.run(`UPDATE schedules SET ${updates.join(', ')} WHERE id = ?`, values);
    }
    res.json({ success: true });
  });

  app.delete('/api/schedules/:id', authenticateAdmin, async (req, res) => {
    await db.run('DELETE FROM schedules WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  app.get('/api/notifications', authenticateToken, async (req, res) => {
    const notifs = await db.all('SELECT * FROM notifications ORDER BY timestamp DESC');
    res.json(notifs);
  });

  // --- Requests API (Time-Off / Swaps) ---
  app.get('/api/requests', authenticateToken, async (req, res) => {
    const requests = await db.all('SELECT * FROM requests ORDER BY createdAt DESC');
    res.json(requests);
  });

  app.post('/api/requests', authenticateToken, async (req, res) => {
    const { type, details, targetShiftId, targetUserId } = req.body;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await db.run(
      'INSERT INTO requests (id, userId, type, status, details, createdAt, targetShiftId, targetUserId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, type, 'pending', details, createdAt, targetShiftId || null, targetUserId || null]
    );

    // If it's a targeted swap request, notify the target employee via LINE
    if (type === 'Swap' && targetUserId) {
      const requester = await db.get('SELECT name FROM users WHERE id = ?', [req.user.id]);
      const targetUser = await db.get('SELECT name, lineUserId FROM users WHERE id = ?', [targetUserId]);
      
      if (targetUser && targetUser.lineUserId && lineConfig.channelAccessToken) {
        try {
          await lineClient.pushMessage({
            to: targetUser.lineUserId,
            messages: [{
              type: 'text',
              text: `Shift Swap Request:\n${requester.name} has requested to swap a shift with you.\nDetails: ${details}\n\nPlease check with your supervisor to approve.`
            }]
          });
        } catch (e) {
          console.error('Failed to notify target user:', e.message);
        }
      }
    }

    res.json({ id, userId: req.user.id, type, status: 'pending', details, createdAt, targetShiftId, targetUserId });
  });

  app.put('/api/requests/:id', authenticateToken, async (req, res) => {
    const { status } = req.body;
    await db.run('UPDATE requests SET status = ? WHERE id = ?', [status, req.params.id]);
    
    // Notify user of status change via LINE if applicable
    const request = await db.get('SELECT * FROM requests WHERE id = ?', [req.params.id]);
    if (request) {
      const user = await db.get('SELECT name, lineUserId FROM users WHERE id = ?', [request.userId]);
      if (user && user.lineUserId && lineConfig.channelAccessToken) {
         try {
           await lineClient.pushMessage({
             to: user.lineUserId,
             messages: [{
               type: 'text',
               text: `Hi ${user.name}, your ${request.type} request has been ${status}.`
             }]
           });
         } catch(e) {}
      }
    }
    res.json({ success: true });
  });

  // --- LINE Webhook ---
  app.post('/api/webhook', async (req, res) => {
    const events = req.body.events;
    if (!events || events.length === 0) {
      return res.status(200).send('OK');
    }

    try {
      for (const event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
          const userText = event.message.text.trim();
          const userId = event.source.userId;
          const cleanedPhone = userText.replace(/\D/g, ''); // Strip all non-digits

          // Check if this text matches any user's email or strictly formatted phone
          const matchedUser = await db.get(
            'SELECT * FROM users WHERE email = ? COLLATE NOCASE OR (phone = ? AND phone != "")',
            [userText, cleanedPhone]
          );

          if (matchedUser) {
            // Found a match! Link the account.
            await db.run('UPDATE users SET lineUserId = ? WHERE id = ?', [userId, matchedUser.id]);
            await lineClient.replyMessage(event.replyToken, {
              type: 'text',
              text: `✅ Success! I have verified your identity as ${matchedUser.name}.\nYour account is now linked. You will receive schedule notifications here.`
            });
          } else {
            await lineClient.replyMessage(event.replyToken, {
              type: 'text',
              text: "❌ Sorry, I couldn't find a matching Email or Phone Number in the system. Please try again or contact your Admin."
            });
          }
        } 
        else if (event.type === 'follow') {
          await lineClient.replyMessage(event.replyToken, {
            type: 'text',
            text: "👋 Welcome to the Schedule Bot!\n\nPlease reply with your registered **Email Address** or **Phone Number** so I can verify your identity and link your account!"
          });
        }
      }
      res.status(200).send('OK');
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(500).send('Error');
    }
  });

  // Catch-all route to serve the React app for any unknown paths (supports React Router)
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Backend API server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
