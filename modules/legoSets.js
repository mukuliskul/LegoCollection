/********************************************************************************
*  WEB322 – Assignment 03
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Mukul Sharma Student ID: 112141221 Date: 22 September 2023
*
********************************************************************************/


const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];


//The purpose of this function is to fill the "sets" array (declared above), by adding copies of all the setData objects
function initalize(){
    return new Promise((resolve) => {
        setData.forEach(data => {
            let themeId = themeData.find((themeElement) => {
                return themeElement.id == data.theme_id;
            });

            data.theme = themeId.name;
            sets.push(data);
        });
        resolve();
    })
}

initalize();

function getAllSets(){
    return new Promise((resolve) => {
        resolve(sets);
    });
}

function getSetByNum(setNum){
    return new Promise((resolve, reject) => {
        let result = sets.find((set)=>{
            return set.set_num == setNum;
        })
        if(result){
            resolve(result);
        }else{
            reject("Unable to find requested set");
        }
    })
}


function getSetsByTheme(theme){
    return new Promise((resolve, reject) => {
        let results = sets.filter((set) => {
            return set.theme.toUpperCase().includes(theme.toUpperCase());
        });

        if(results.length > 0){
            resolve(results);
        }else{
            reject("Unable to find requested set");
        }
    })
}

module.exports = {initalize, getAllSets, getSetByNum, getSetsByTheme};