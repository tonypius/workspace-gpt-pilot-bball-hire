// Load environment variables
require("dotenv").config();
const http = require('http');
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const authRoutes = require("./routes/authRoutes");
const playerRoutes = require('./routes/playerRoutes');
const coachRoutes = require('./routes/coachRoutes');
const messageRoutes = require('./routes/messageRoutes'); // Added for messaging feature
const transferPlayerRoutes = require('./routes/transferPlayerRoutes'); // Added for transfer player feature
const feedbackRoutes = require('./routes/feedbackRoutes'); // Added for feedback feature
const eventRoutes = require('./routes/eventRoutes'); // Added for event management feature
const userTypeMiddleware = require('./routes/middleware/userTypeMiddleware');
const Player = require('./models/Player');
const Coach = require('./models/Coach');
const TransferPlayer = require('./models/TransferPlayer');
const socketIo = require('socket.io');

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server);

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

app.use(userTypeMiddleware);

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('joinRoom', (eventId) => {
    console.log(`A user joined room: ${eventId}`);
    socket.join(eventId);
  });
});

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Player and Coach Routes
app.use('/players', playerRoutes);
app.use('/coaches', coachRoutes);

// Message Routes - Added for the messaging feature
app.use(messageRoutes);

// Transfer Player Routes - Added for the transfer player feature
app.use('/transferPlayers', transferPlayerRoutes);

// Feedback Routes - Added for the feedback feature
app.use(feedbackRoutes);

// Event Routes - Added for the event management feature
app.use(eventRoutes);

// Root path response with userTypeMiddleware integration
app.get("/", async (req, res, next) => {
  // Check if the user is logged in and has a role
  if (req.session && req.session.userId && req.userRole) {
    try {
      let profiles = [];
      // Fetch profiles based on user's role
      switch (req.userRole) {
        case 'player':
          profiles = await Player.find({}).catch(err => {
            console.error("Error fetching player profiles", err);
            throw err;
          });
          break;
        case 'coach':
          profiles = await Coach.find({}).catch(err => {
            console.error("Error fetching coach profiles", err);
            throw err;
          });
          break;
        case 'transferPlayer':
          profiles = await TransferPlayer.find({}).catch(err => {
            console.error("Error fetching transfer player profiles", err);
            throw err;
          });
          break;
        default:
          console.log('Unknown user role');
      }
      // Pass profiles data to the view
      res.render("index", { userRole: req.userRole, profiles: profiles });
    } catch (error) {
      console.error(`Error fetching profiles for role ${req.userRole}: ${error.message}`);
      console.error(error.stack);
      next(error); // Pass the error to the error handler
    }
  } else {
    // If not logged in or no role found, just render the index without user data
    res.render("index");
  }
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

// Change app.listen to server.listen to integrate Socket.IO
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});