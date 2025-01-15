const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs'); // File System library 

const salt = bcrypt.genSaltSync(10); // To hash or encrypt a password
const secret = '123b4kjbj2b3jbk12kj3bbk4jbb21k3jb4l12nn34'; // Random shit just for json webtoken

app.use(cors({credentials: true, origin: 'http://localhost:5173'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads')); // Endpoint that access the images used

mongoose.connect('mongodb+srv://blog:O6tuDhCaog5B8pTh@cluster0.xsneg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

app.post('/register', async (req, res) => { 
  const {username, password} = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.status(201).json(userDoc); // Return success response
  } catch (e){
    console.error('Error during user registration:', e); // Log the error on the server
    res.status(400).json({ error: e.message }); // Send error message to client
  }
});

app.post('/login', async (req, res) => {
  const {username, password} = req.body;
  const userDoc = await User.findOne({username})
  const passwordOk = bcrypt.compareSync(password, userDoc.password); // To compare database
  if (passwordOk) {
    // If logged in, respond with JSON webtoken
    jwt.sign({username, id:userDoc._id}, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id: userDoc._id,
        username,
      }); //sent as a cookie
    });
  } else {
    res.status(400).json('Wrong credentials');
  }
});

// Confirm if the user is logged in (with usage of cookies)
app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' }); // Handle missing token
  }
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      console.error('Token verification failed:', err.message); // Log error for debugging
      return res.status(401).json({ error: 'Invalid or expired token' }); // Handle invalid token
    }
    res.json(info); // Send user profile information
  });
});

// For posting content
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  // To rename the filename to the original name
  const {originalname, path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  // This gets the data/infos necessary from create posts (to be used in post.jsx)
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const {title, summary, content} = req.body;
    const postDoc = await Post.create({
      title,    
      summary,
      content,
      cover: newPath,
      author: info.id,
    });
    res.json(postDoc);
  });
});

// For editing posts
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const {id, title, summary, content} = req.body;
    const postDoc = await Post.findById(id)
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id); // Compares the two credentials
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
    
    res.json(postDoc);
  });
});

console.log('hehe');

// Formatting the post
app.get('/post', async (req, res) => {
  res.json(
    await Post.find()
    .populate('author', ['username']) // Determines the username of the author
    .sort({createdAt: -1}) // Sorts the posts at the homepage
    .limit(20) // This limits the posts seen at the homepage to 20 posts.
  );
});

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
});

const PORT = 4000; // or any other available port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
//username: blog
//Password: O6tuDhCaog5B8pTh
//const uri = "mongodb+srv://blog:O6tuDhCaog5B8pTh@cluster0.xsneg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";