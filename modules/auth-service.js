const mongoose = require('mongoose');
let Schema = mongoose.Schema;
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Define the schema for the login history as an array of objects
let loginHistorySchema = new Schema({
  dateTime: {
    type: Date,
    default: Date.now
  },
  userAgent: {
    type: String,
    default: ''
  }
});

let userSchema = new Schema({
  userName: {
    type: String,
    unique: true, // userName must be unique
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  loginHistory: [loginHistorySchema] // Array of login history records
});

let User;

function initialize(){
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB);
    db.on('error', (err) => {
      reject(err);
    });

    db.once('open', () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
}

function registerUser(userData){
  return new Promise((resolve, reject) => {
    if(userData.password === userData.password2){
      bcrypt.hash(userData.password, 10)
        .then(hash => {
          userData.password = hash; // Replace the user entered password with its hashed version
          let newUser = new User(userData);
          newUser
            .save()
            .then(() => {
              resolve();
            })
            .catch((err) => {
              if(err.code == 11000){
                reject("User Name already Taken");
              }else{
                reject("There was an error creating the user: " + err);
              };
            }); 
        })
        .catch(err => {
          reject("There was an error encrypting the password");
        });
    }else{
      reject('Passwords do not match')
    }
  });
}

function checkUser(userData){
  return new Promise((resolve, reject) => {
    User.find({userName : userData.userName})
      .exec()
      .then((users)=> {
        if(users.length == 0){
          reject("Unable to find user: " + userData.userName);
        }else{
          bcrypt.compare(userData.password, users[0].password)
            .then((result) => {
              if(result === false){
                reject("Incorrect Password for user: " + userData.userName);
              }else{
                if(users[0].loginHistory.length == 8){
                  users[0].loginHistory.pop();
                }

                users[0].loginHistory.unshift({
                  dateTime: (new Date()).toString(), 
                  userAgent: userData.userAgent
                });

                User.updateOne({userName: users[0].userName}, {
                  $set : {
                    loginHistory : users[0].loginHistory
                  }
                }).exec()
                  .then(() => {
                    resolve(users[0]);
                  })
                  .catch((err => {
                    reject("There was an error verifying the user: " + err);
                  }))
              }
            })
            .catch((err) => {
              reject("There was an error verifying the user: " + err);
            });
        }
      })
      .catch((err) => {
        reject("Unable to find user: " + userData.userName);
      })
  });
}

module.exports = { initialize, registerUser, checkUser };