require("dotenv").config();

const express = require('express');  // Module import: Importing the Express framework for building web applications.
const cors = require('cors');  // Module import: Importing the CORS (Cross-Origin Resource Sharing) middleware for handling cross-origin, allows cross-origin requests to the server.
const mongoose = require("mongoose");  // ODM (Object Data Modeling): For working with MongoDB in a structured way.
const User = require('./models/User');  // Importing the User model for database operations.
const Post = require('./models/Post');  // Importing the Post model for handling blog posts.
const bcrypt = require('bcryptjs');     // Module import: Importing the bcrypt library for password hashing and verification, for hashing passwords to ensure secure storage.
const app = express();                  // Application instance: Initializing an Express application.
const jwt = require('jsonwebtoken');  // Authentication: For generating and verifying JSON Web Tokens.
const cookieParser = require('cookie-parser');  // Middleware: To parse cookies from incoming requests.
const multer = require('multer');     // File upload handling: Middleware for handling multipart/form-data (used for file uploads).
const uploadMiddleware = multer({ dest: 'uploads/' });  // Configuration: Specifies the directory to store uploaded files temporarily.
const fs = require('fs');    // File system module: To handle file operations (e.g., renaming uploaded files).
const pathBuild = require("path");

const salt = bcrypt.genSaltSync(10); // To hash or encrypt a password
const secret = process.env.JWT_SECRET; // Secret key: Used to sign and verify JWTs (should ideally be stored securely). [The content of this variables are just random shits just for json webtoken]
const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT || 4000;
const corsOrigin = process.env.CORS_ORIGIN;

app.use(cors({credentials: true, origin: corsOrigin || '*'}));  // Middleware: Configures CORS to allow credentials and specific origin.
app.use(express.json());  // Middleware: Parses incoming JSON request bodies.
app.use(cookieParser());  // Middleware: Parses cookies for incoming requests.
app.use('/uploads', express.static(__dirname + '/uploads'));  // Static files: Serves uploaded files as static resources. Endpoint that access the images used.

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Updated to omit deprecated options
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    console.log('Mongo DB:', process.env.MONGO_URI);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

// Example usage of the variable:
const portLink = process.env.PORT_LINK;
console.log('API Base URL:', portLink);


// Route handler: Defines the endpoint for user registration.
app.post('/register', async (req, res) => {
  const {username, password} = req.body;  
  // Destructuring: Extracting username and password from the request body.
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
      // Password hashing: Ensures passwords are not stored as plain text.
    });
    res.status(201).json(userDoc);  // HTTP status code: Returns a 201 (Created) response. Returns success response
  } catch (e){
    console.error('Error during user registration:', e);  // Error handling: Logs errors during registration.
    res.status(400).json({ error: e.message });   // HTTP status code: Returns a 400 (Bad Request) on failure.
  }
});

// Route handler: Defines the endpoint for user login.
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const userDoc = await User.findOne({ username }); // Database query: Finds a user by username.
    
    if (!userDoc) {
      // If user is not found, send an appropriate response.
      return res.status(400).json({ error: 'User not found' });
    }

    const passwordOk = bcrypt.compareSync(password, userDoc.password); // Password validation: Compares input password with hashed password in DB.
    
    if (passwordOk) {
      // If logged in, respond with JSON web token.
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err; // JWT generation: Signs a JWT with user info.
        res.cookie('token', token).json({
          id: userDoc._id,
          username,
        }); // Cookie handling: Sends the token as a cookie.
      });
    } else {
      res.status(400).json({ error: 'Wrong credentials' }); // Error response: Indicates invalid login credentials.
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route handler: Defines the endpoint for logging out.
app.post('/logout', (req, res) => {
  res.clearCookie('token');   // Cookie management: Clears the JWT cookie to log out the user.
  res.json({ message: 'Logged out successfully' });  // Send a success response
});

// Route handler: Retrieves user profile if authenticated. Confirm if the user is logged in (with usage of cookies)
app.get('/profile', (req, res) => {
  const { token } = req.cookies;  // Cookie extraction: Retrieves the token from cookies.
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });  // Authorization check: Rejects requests without a token.
  }
  jwt.verify(token, secret, {}, (err, info) => {
    // Token verification: Checks if the token is valid.
    if (err) {
      console.error('Token verification failed:', err.message); // Log error for debugging
      return res.status(401).json({ error: 'Invalid or expired token' }); // Handle invalid token
    }
    res.json(info); // Send user profile information
  });
});

// Route handler: Handles blog post creation with file uploads. For posting content.
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  // To rename the filename to the original name
  const {originalname, path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];  // File extension extraction: Extracts the file extension.
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);  // File operation: Renames the uploaded file.

  // This gets the data/infos necessary from create posts (to be used in post.jsx)
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const {title, summary, content} = req.body;
    const postDoc = await Post.create({
      title,    
      summary,
      content,
      cover: newPath,  // File path: Stores the path of the uploaded file.
      author: info.id,
    });
    res.json(postDoc);  // Response: Sends the created post as JSON.
  });
});

// For editing posts
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;
  // Check if a new file is uploaded and process it
  if (req.file) {   
    const {originalname, path} = req.file;  // Extract the original file name and path
    const parts = originalname.split('.');  // Split the filename to get the file extension
    const ext = parts[parts.length - 1];  // Get the file extension
    newPath = path+'.'+ext;   // Rename the file to include its original extension
    fs.renameSync(path, newPath);  // Rename the temporary file
  }

  const {token} = req.cookies;  // Extract the JWT token from cookies

  // Verify the token to confirm user identity
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;   // Handle any token verification errors
    const {id, title, summary, content} = req.body; // Extract the post data from the request body
    const postDoc = await Post.findById(id);    // Retrieve the post to be edited using its ID
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id); // Check if the current user is the author of the post. Compares the two credentials
    if (!isAuthor) {
      return res.status(400).json('You are not the author');
    }
    // Update postDoc if the user is the author
    await postDoc.updateOne({ 
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover, // Changes the cover if a new file is uploaded, maintain cover if no new file uploaded
    });
    
    res.json(postDoc);  // Send the updated post details as a response
  });
});

// Deleting the post
app.delete('/post/:id', async (req, res) => {
  const { token } = req.cookies;
  const { id } = req.params;    // Extract the post ID from the URL parameters

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });   // Respond with an error if no token is provided
  }

  // Verify the token to confirm user identity
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const postDoc = await Post.findById(id);  // Retrieve the post to be deleted using its ID
    if (!postDoc) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);  // Check if the current user is the author of the post
    if (!isAuthor) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    await postDoc.deleteOne();   // Delete the post from the database
    res.json({ message: 'Post deleted successfully' });
  });
});

// Formatting the post
app.get('/post', async (req, res) => {
  res.json(
    await Post.find()   // Retrieve all posts from the database
    .populate('author', ['username'])  // Include the author's username in the post data
    .sort({createdAt: -1})   // Sorts the posts at the homepage
    .limit(20)   // This limits the posts seen at the homepage upto only 20 posts.
  );
});

// Retrieve a single post by its ID
app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);   // Retrieve the post and include the author's username
  res.json(postDoc);   // Send the post details as a response
});

// Serve static files from the 'dist' directory
app.use(express.static(pathBuild.join(__dirname, "dist")));

// Catch-all route to serve React's index.html for any unmatched routes
app.get("/*", (req, res) => {
  res.sendFile(pathBuild.join(__dirname, "./dist", "index.html"));
});

// Start the server and listen for incoming requests
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Run successful...')
});

//username: blog
//Password: O6tuDhCaog5B8pTh
//const uri = "mongodb+srv://blog:O6tuDhCaog5B8pTh@cluster0.xsneg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";