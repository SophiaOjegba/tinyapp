// Import the necessary modules and set up the Express application
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser')
app.use(cookieParser());

// Function to generate a random alphanumeric string used for short URL IDs
function generateRandomString(){
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let charlength = 6
  let randommString = "";

  for (let i = 0; i < charlength; i++){
    randonmChar = Math.floor(Math.random() * chars.length)
    randommString += chars.substring( randonmChar, randonmChar + 1)
  }
  return randommString;
};

// Helper function email lookup

function getUserByEmail(newEmail) {
  for (let emailId in users )
    if (newEmail === users[emailId].email){
      return users[emailId];    
  
  }
  return null;
}

// Database to store short URLs and their corresponding long URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Database for users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Route to handle requests to the root path "/"
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Route to provide the JSON representation of the urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route to display a simple "Hello World" message
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Route to display the list of all short URLs in the 'urlDatabase'
app.get("/urls", (req, res) => {
  // Renders the "urls_index.ejs" template and passes 'urlDatabase' and 'username' to it
  const templateVars = { urls: urlDatabase, users : [req.cookies.userID] };
  res.render("urls_index", templateVars);
});

// Route to display a form for creating a new short URL
app.get("/urls/new", (req, res) => {
  // Renders the "urls_new.ejs" template and passes 'id', 'longURL', and 'username'
  const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id], users : [req.cookies.userID] };
  res.render("urls_new", templateVars);
});

// Route to display details of a specific short URL and its corresponding long URL
app.get("/urls/:id", (req, res) => {
   // Renders the "urls_show.ejs" template and passes 'id', 'longURL', and 'username'
  const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id], users : [req.cookies.userID]};
  res.render("urls_show", templateVars);
  
});


app.get("/urls/:id", (req, res) => {
   
  const id = req.params.id;
  const longURL = urlDatabase[id];

  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
});

// Route to redirect the user to the long URL associated with a specific short URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  console.log(longURL)
  if(!longURL ){
   res.status(404).send()
   return;
  }
 res.redirect(longURL);
});


app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

   if (!longURL) {
     // URL with the specified 'id' not found
     return res.status(404).send(`URL with ID ${id} not found.`);
   }
  // 
  const templateVars = {
    longURL, id
  }
  res.render(`urls_show`, templateVars);
});

// Registration page
app.get("/register", (req, res) => {
  

  res.render("urls_registration")
});





// Route to handle the creation of a new short URL and its long URL
app.post("/urls", (req, res) => {

  try {
    new URL(req.body.longURL);
  } catch (error) {
    return res.status(400).send(`This is not a valid url`);
  }

  const newId = generateRandomString(); 
  const newLongURL = req.body.longURL; 
  urlDatabase[newId] = newLongURL;


  // Redirect the user to the show page for the newly created entry
  res.redirect(`/urls/${newId}`);
});

// Route to handle the deletion of a specific short URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

   if (!longURL) {
     // URL with the specified 'id' not found
     return res.status(404).send(`URL with ID ${id} not found.`);
   }
     delete urlDatabase[id];
   

  // Redirect the user to url page
  res.redirect(`/urls`);
});

// Route to handle the update of a specific short URL's long URL
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

   if (!longURL) {
     // URL with the specified 'id' not found
     return res.status(404).send(`URL with ID ${id} not found.`);
   }
   try {
    new URL(req.body.longURL);
  } catch (error) {
    return res.status(400).send(`This is not a valid url`);
  }
  //Updates the 'urlDatabase' with the new long URL for the specified short URL
  const newLongURL = req.body.longURL; 
  urlDatabase[id] = newLongURL;

  res.redirect("/urls")
});

// Route to handle user login (setting a username as a cookie)
app.post("/login", (req, res) => {
  res.cookie('user_id',  req.body.userID)

  res.redirect("/urls")
});

// Route to handle user logout (clearing the 'username' cookie)
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')

  res.redirect("/urls")
});

// Registration page
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  if (newEmail === "" || newPassword === ""){
    return res.status(404).send(`The email or password can not be empty`);
  }

  const user = getUserByEmail(newEmail)
  if(user){
    return res.status(404).send(`User already exists`);
  }

  users[userID] = {
    id : userID,
    email : newEmail,
    password : newPassword };
    res.cookie('user_id', userID)
    console.log(users)
  res.redirect("/urls")
});


// Start the server and listen on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});