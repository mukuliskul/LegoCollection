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
require('dotenv').config();
const Sequelize = require('sequelize');

//setup sequelize to point to our postgres database
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);


const Theme = sequelize.define(
    'Theme',
    {
        id: {
            type : Sequelize.INTEGER,
            primaryKey : true,
            autoIncrement : true,
        },
        name : Sequelize.STRING,
    },
    {
        createdAt : false,
        updatedAt : false,
    }
);

const Set = sequelize.define(
    'Set',
    {
        set_num : {
            type : Sequelize.STRING,
            primaryKey : true,
        },
        name : Sequelize.STRING,
        year : Sequelize.INTEGER,
        num_parts : Sequelize.INTEGER,
        theme_id : Sequelize.INTEGER,
        img_url : Sequelize.STRING,
    },
    {
        createdAt : false,
        updatedAt : false,
    }
);

Set.belongsTo(Theme, {foreignKey : 'theme_id'});

//The purpose of this function is to fill the "sets" array (declared above), by adding copies of all the setData objects
function initialize(){
    return new Promise((resolve, reject) => {
        sequelize.sync().then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        });
    })
};

initialize();

function getAllSets(){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Set.findAll({include : Theme}).then((data) => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            });
        });
    });
}

function getSetByNum(setNum){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Set.findAll({
                include : Theme,
                where : {
                    set_num : setNum,
                },
            }).then((data)=>{
                resolve(data[0]);
            }).catch((err) =>{
                reject(err);
            });
        });
    });
};


function getSetsByTheme(theme){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Set.findAll({
                include: [Theme],
                where: { 
                '$Theme.name$': {
                [Sequelize.Op.iLike]: `%${theme}%`
                }
            }}).then((data) => {
                resolve(data)
            }).catch((err) =>{
                reject('Unable to find requested sets');
            });
        });
    });
};      

function addSet(setData){
    return new Promise((resolve,reject) =>{
        sequelize.sync().then(() => {
            Set.create({
                set_num : setData.set_num,
                name : setData.name,
                year : setData.year,
                num_parts : setData.num_parts,
                theme_id : setData.theme_id,
                img_url : setData.img_url,
            }).then(()=> {
                resolve();
            }).catch((err) => {
                reject(err.errors[0].message);
            });
        });
    })
}

function getAllThemes(){
    return new Promise((resolve,reject) =>{
        sequelize.sync().then(() => {
            Theme.findAll().then((data) => {
                resolve(data);
            }).catch((err) => {
                reject(err);
            });
        });
    });
}

function editSet(set_num, setData){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Set.update(
                {
                    name : setData.name,
                    year : setData.year,
                    num_parts : setData.num_parts,
                    theme_id : setData.theme_id,
                    img_url : setData.img_url,
                },
                {
                    where : { set_num : set_num },
                }
            ).then(() => {
                resolve();
            }).catch((err) => {
                reject(err.errors[0].message);
            });
        });
    });
};

function deleteSet(set_num){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Set.destroy({
                where : { set_num : set_num },
            }).then(() => {
                resolve();
            }).catch((err) => {
                reject(err.errors[0].message);
            });
        });
    });
}

module.exports = {initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet}; 
