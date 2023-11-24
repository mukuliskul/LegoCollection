/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Mukul Sharma Student ID: 112141221 Date: 10 November 2023
*
********************************************************************************/

const legoData = require("./modules/legoSets");
const express =  require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));

app.use(express.static('public')); 
app.use(express.urlencoded({extended:true})); // middleware for urlencodede data

legoData.initalize().then(() => {
    console.log("Initialized");
    app.listen(HTTP_PORT, () => console.log(`server listening on ${HTTP_PORT}`));
})

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.get('/lego/addSet', (req, res) => {
    legoData.getAllThemes().then((data) => {
        res.render("addSet", { themes: data });
    }).catch((error) => {
        res.status(404).render("404", {message : "Unable to find request sets."})
    });
});

app.post('/lego/addSet', (req, res) =>{
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

app.post('/lego/editSet', (req, res) => {
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

app.use((req, res, next) => {
    res.status(404).render("404", {message : "I'm sorry, we're unable to find what you're looking for"});
});
