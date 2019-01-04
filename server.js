const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');


const app = express();

//Body Parser Middlewhere
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//DB Configuration
const db = require('./config/keys').mongoURI;

// Connect to MongDB 
mongoose
    .connect(db) //, { useNewUrlParser: true } May need to use this later
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World'));

//User Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
