// Import the necessary modules 
const express = require("express");
const bcrypt = require("bcryptjs");
const {getUserByEmail, urlsForUser, generateRandomString } = require("./helpers")
const cookieSession = require('cookie-session')

const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


// Database to store short URLs and their corresponding long URLs
const urlDatabase = {
  b6UTxQ: {
    longURL: "http://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "http://www.google.ca",
    userID: "aJ48lW",
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user3RandomID",
  }
};

//Database for users
const users = {
  aJ48lW: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "a@a.con",
    password: bcrypt.hashSync("mee", 10)
  }
};


//GET ROUTES

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
  const id = req.session.user_id;
  // Renders the "urls_index.ejs" template and passes 'urlDatabase' and 'email' to it
  const userObject = users[req.session.user_id]
  const templateVars = { urls: urlsForUser(id, urlDatabase), user : userObject };
  res.render("urls_index", templateVars);
});

// Route to display a form for creating a new short URL
app.get("/urls/new", (req, res) => {
  const userObject = users[req.session.user_id]
  const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id], user : userObject  };
  if (userObject){
    return res.render("urls_new",  templateVars)
  }
  else{
  return res.redirect('/login');
  };
});

// Route to display details of a specific short URL and its corresponding long URL
app.get("/urls/:id", (req, res) => {
  const userObject = users[req.session.user_id]
  const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id].longURL, user : userObject  };
  if (userObject){
    if ( !urlDatabase[req.params.id]) {
      // URL with the specified 'id' not found
      return res.status(404).send("You do not have this url");
    }
    return res.render(`urls_show`, templateVars)
  }
  else{
     res.status(404).send("<html><body>Please Login to visit this page</body></html>\n");
  };
  
  if (!longURL) {
    // URL with the specified 'id' not found
    return res.status(404).send("<html><body>This Url does not exist</body></html>\n");
  }
});

// Route to redirect the user to the long URL associated with a specific short URL
app.get("/u/:id", (req, res) => {
 
  const longURL = urlDatabase[req.params.id].longURL;
  if(!longURL ){
   return res.status(404).send("<html><body>This Url does not exist</body></html>\n")

  }
  res.redirect(longURL);

});

// Registration page
app.get("/register", (req, res) => {
  const userObject = users[req.session.user_id]
  const templateVars = { user : userObject  };
  if (userObject){
    res.redirect("/urls")
  }
  else{
  res.render("urls_registration", templateVars)
  }
});

// Login page
app.get("/login", (req, res) => {
  const userObject = users[req.session.user_id]
  const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id], user : userObject  };
  if(userObject){
    res.redirect("/urls")
  }
  else{
  res.render("urls_login", templateVars)
  }
});




//POST ROUTES

// Route to handle the creation of a new short URL and its long URL
app.post("/urls", (req, res) => {
  const userObject = users[req.session.user_id]
  if(userObject){
  
    try {
      new URL(req.body.longURL);
    } catch (error) {
      return res.status(400).send(`This is not a valid url`);
    }
  
    const newId = generateRandomString(); 
    const newlongURL = req.body.longURL; 
    urlDatabase[newId] = {
      longURL:  newlongURL, 
      userID: req.session.user_id
    }
    
  // Redirect the user to the show page for the newly created entry
  res.redirect(`/urls/${newId}`);
  }
  else{
    res.status(404).send("<html><body>You must be logged in to create new url</body></html>\n")
  }
});

// Route to handle the deletion of a specific short URL
app.post("/urls/:id/delete", (req, res) => {
  const userObject = users[req.session.user_id]
  if (userObject){
    if (!urlDatabase[req.params.id]) {
      return res.status(404).send("You do not have this url");
    }
    delete urlDatabase[req.params.id];
  
    res.redirect(`/urls`);
  }
  else{
     res.status(404).send("<html><body>Please Login to visit this page</body></html>\n");
  };

});

// Route to handle the update of a specific short URL's long URL
app.post("/urls/:id/edit", (req, res) => {
  const userObject = users[req.session.user_id]
  if (userObject){
    
    if (!urlDatabase[req.params.id]) {
      return res.status(404).send("You do not have this url");
    }
    try {
     new URL(req.body.longURL);
   } catch (error) {
     return res.status(400).send(`This is not a valid url`);
   }
   //Updates the 'urlDatabase' with the new long URL for the specified short URL
   const newlongURL = req.body.longURL; 
   urlDatabase[req.params.id].longURL = newlongURL;
  
   res.redirect("/urls")
  }
  else{
  res.redirect('/login');
  };
});

// Route to handle user login (setting a username as a cookie)
app.post("/login", (req, res) => {
  const {email: userEmail, password: userPassword} = req.body
    // check the user information
  if (!userEmail || !userPassword ){
    return res.status(404).send("Email or password cannot be empty");
  }

  const userFound = getUserByEmail(userEmail, users)
  if (!userFound || !bcrypt.compareSync(userPassword, userFound.password)){
    return res.status(403).send("Incorrect email or password");
  }

   // set the user id as a cookie value then redirect the user to the urls page
   req.session.user_id = userFound.id;
   return res.redirect('/urls');
});


// Route to handle user logout (clearing the 'username' cookie)
app.post("/logout", (req, res) => {

  req.session = null;

  res.redirect("/urls")
});

// Registration page
app.post("/register", (req, res) => {
  const {email: newEmail, password: newPassword} = req.body
  
  //Checking if fields are empty
  if (newEmail === "" || newPassword === ""){
    return res.status(404).send(`The email or password can not be empty`);
  }
  
  //check if usser already exists
  const user = getUserByEmail(newEmail, users)
  if(user){
    return res.status(404).send(`User already exists`);
  }

  const userID = generateRandomString();

  //create user object
  users[userID] = {
    id: userID,
    email: newEmail,
    password: bcrypt.hashSync(newPassword, 10),
  };

  req.session.user_id = userID;
  
  res.redirect("/urls")
});


// Start the server and listen on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});