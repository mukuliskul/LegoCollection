/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Mukul Sharma Student ID: 112141221 Date: 12 December 2023
*
*  Published URL: https://legocollection.cyclic.app
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const authData = require('./modules/auth-service');
const express =  require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const path = require('path');
const clientSessions = require('client-sessions');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));

app.use(express.static('public')); 
app.use(express.urlencoded({extended:true})); // middleware for urlencoded data
app.use(
    clientSessions({
        cookieName: 'session', // this is the object name that will be added to 'req'
        secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', // this should be a long un-guessable string.
        duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
        activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute) 
    })
);

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    // Remove unused 'req' variable
    res.render("home");
});

app.get('/login', (req, res) => {
    // Remove unused 'req' variable
    res.render("login", { errorMessage : "", userName : ""});
});

app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName, // authenticated user's userName
            email: user.email,// authenticated user's email
            loginHistory: user.loginHistory// authenticated user's loginHistory
        }
    
        res.redirect('/lego/sets');
    }).catch((err) => {
        res.render("login", { errorMessage: err, userName : req.body.userName});
    });
});

app.get('/register', (req, res) => {
    // Remove unused 'req' variable
    res.render("register", { errorMessage: "", userName : "", successMessage: "" });
});

app.post('/register', (req, res) => {
    authData.registerUser(req.body).then(() => {
        res.render("register", { errorMessage: "", userName : "", successMessage: "User created" });
    }).catch((err) => {
        res.render("register", { errorMessage: err, userName : req.body.userName, successMessage: "" });
    })
});

app.get('/logout', ensureLogin, (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
    // Remove unused 'req' variable
    res.render("userHistory")
});

app.get('/about', (req, res) => {
    // Remove unused 'req' variable
    res.render("about");
});

app.get('/lego/addSet', (req, res) => {
    // Remove unused 'req' variable
    legoData.getAllThemes().then((data) => {
        res.render("addSet", { themes: data });
    }).catch((error) => {
        res.status(404).render("404", {message : "Unable to find requested sets."})
    });
});

app.post('/lego/addSet', ensureLogin, (req, res) =>{
    legoData.addSet(req.body).then(() => {
        res.redirect("/lego/sets");
    }).catch((err) => {
        //not setting status to 500 as it causes error on cyclic
        res.render("500", {message : `I'm sorry, but we have encountered the following error: ${err}`});
    });
});

app.get('/lego/sets', (req, res) => {
    if(req.query.theme){
        legoData.getSetsByTheme(req.query.theme).then(data => {
            res.render("sets", {sets : data});
        }).catch(error => {
            res.status(404).render("404", {message : "Unable to find requested sets."});
        })
    }else{
        legoData.getAllSets().then(data => {
            res.render("sets", {sets:data})
        });
    }
})

app.get('/lego/sets/:set_num', (req, res) => {
    legoData.getSetByNum(req.params.set_num).then(data => {
        res.render("set", {set : data});
    }).catch(error => {
        res.status(404).render("404", {message : "Unable to find requested set."});
    });
});

app.get('/lego/editSet/:num', (req, res) => {
    legoData.getSetByNum(req.params.num).then(data => {
        legoData.getAllThemes().then((themeData) => {
            res.render("editSet", { themes: themeData, set: data });
        }).catch((err) =>{
            res.status(404).render("404", { message: err });
        });
    }).catch(error => {
        res.status(404).render("404", { message: err });
    });
});

app.post('/lego/editSet', ensureLogin, (req, res) => {
    legoData.editSet(req.body.set_num, req.body).then(() => {
        res.redirect('/lego/sets');
    }).catch((err) => {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.get('/lego/deleteSet/:num', (req, res) => {
    legoData.deleteSet(req.params.num).then(() =>{
        res.redirect('/lego/sets');
    }).catch((err) => {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.post('/lego/deleteSet/:num', ensureLogin, (req, res) => {
    legoData.deleteSet(req.params.num).then(() =>{
        res.redirect('/lego/sets');
    }).catch((err) => {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.use((req, res, next) => {
    // Remove unused 'req' variable
    res.status(404).render("404", {message : "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize()
  .then(() => authData.initialize())
  .then(() => {
    app.listen(HTTP_PORT, function() {
      console.log(`app listening on: ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.log(`unable to start server: ${err}`);
});