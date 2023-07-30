// Helper function email lookup
const getUserByEmail = function(email, database) {
  for(let user in database ){
    if (email === database[user].email)
    return database[user];
  } 
  return undefined;
};

//get userid corresponding to URL
function urlsForUser(id, urlDatabase){
  let userUrl ={}
  for (const shortUrl in urlDatabase )
    if (id === urlDatabase[shortUrl].userID){
      userUrl[shortUrl] = urlDatabase[shortUrl];    
  
  }
  return userUrl;
};

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

function urlAccess(req, res, shortUrl, urlDatabase, users){
  const userObject = users[req.session.user_id]

  if (!userObject){
    res.status(404).send("<html><body>Please Login to visit this page</body></html>\n")
  }
  if (!urlDatabase[shortUrl]) {
    return res.status(404).send("You do not have this url");
  }
  if (userObject.id !== urlDatabase[shortUrl].userID){
  
    return res.status(404).send("You do not own this url");
  }

return true;
}



module.exports = {getUserByEmail, urlsForUser, generateRandomString, urlAccess};
