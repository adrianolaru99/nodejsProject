const _ = require('lodash');
const Sequelize = require('sequelize');
const Faker = require('faker');
const Conn = new Sequelize('db','user','pass',{
    host: 'localhost',
    dialect: 'sqlite',
    storage: 'db.sqlite',
    operatorAliases: false,

    define:{
        freezeTableName: true
    }
})

const Person = Conn.define('person',{
    firstName:{
        type:Sequelize.STRING,
        allowNull:false
    },
    lastName:{
        type:Sequelize.STRING,
        allowNull: false
    },
    email:{
        type:Sequelize.STRING,
        allowNull: false
    }
})
const AuthData = Conn.define('authData',{
    userId:{
        type:Sequelize.INTEGER,
        allowNull: false
    },
    token:{
        type:Sequelize.STRING,
        allowNull: false
    }
})
const Post = Conn.define('post',{
    title:{
        type:Sequelize.STRING,
        allowNull: false
    },
    content:{
        type: Sequelize.STRING,
        allowNull: false
    }
})

const User = Conn.define('user',{
    email:{
        type:Sequelize.STRING
    },
    password:{
        type:Sequelize.STRING
    }
})

Person.hasMany(Post);
Post.belongsTo(Person);
var start = 0;
count = 1;
Conn.sync({force: true}).then(()=>{
    _.times(10, () =>{
        return Person.create({
            firstName: Faker.name.firstName(),
            lastName: Faker.name.lastName(),
            email: Faker.internet.email()
        })
    })}).then(() => {
        _.times(20,() =>{
            count = count+1;
        if(count%2 == 0)
        start = start + 1
        return Post.create({
            title: Faker.lorem.text(),
            content: Faker.lorem.text(),
            personId: start
        });
    })})
module.exports ={Conn, Person, Post, User,AuthData}