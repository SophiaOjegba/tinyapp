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



module.exports = {getUserByEmail, urlsForUser, generateRandomString};
