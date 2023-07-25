const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

function generateRandomString(){
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let charlength = 6
  let randommString = "";

  for (let i = 0; i < charlength; i++){
    randonmChar = Math.floor(Math.random() * chars.length)
    randommString += chars.substring( randonmChar, randonmChar + 1)
  }
  return randommString;
}
let result = generateRandomString()
console.log(result)

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
  
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
});

// Route handler for adding new entries to the urlDatabase object
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

  const newLongURL = req.body.longURL; 
  urlDatabase[id] = newLongURL;

  res.redirect("/urls")
});

app.get("/u/:id", (req, res) => {
   const longURL = urlDatabase[req.params.id]
   console.log(longURL)
   if(!longURL ){
    res.status(404).send()
    return;
   }
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});