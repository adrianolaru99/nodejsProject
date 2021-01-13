
const graphql = require('graphql');
const Db = require('../db/db');
const jwt = require('jsonwebtoken');
const { INTEGER } = require('sequelize');

const Person = new graphql.GraphQLObjectType({
    name: 'Person',
    description: 'This represents a Person',

    fields: () =>({
        id: {
            type:graphql.GraphQLInt,
            resolve(person) {
                return person.id
            }
        },
        firstName: {
            type: graphql.GraphQLString,
            resolve(person){
                return person.firstName
            }
        },
        lastName: {
            type: graphql.GraphQLString,
            resolve(person){
                return person.lastName
            }
        },
        email: {
            type: graphql.GraphQLString,
            resolve(person){
                return person.email
            }
        }
        ,
                    posts:{
                        type: new graphql.GraphQLList(Post),
                        resolve(person){
                            return person.getPosts();
                        }
                    }
    })
})
const Post = new graphql.GraphQLObjectType({
    name: 'Post',
    description: 'This represents a Post',
    fields: () =>({
        id: {
            type:graphql.GraphQLInt,
            resolve(post){
                return post.id;
            }
        },
        ttile: {
            type: graphql.GraphQLString,
            resolve(post){
                return post.ttile
            }
        },
        content: {
            type: graphql.GraphQLString,
            resolve(post){
                return post.content
            }
        },
        person: {
            type: Person,
            resolve(post){
                return post.getPerson()
            }
        }
    
    })
})

const User = new graphql.GraphQLObjectType({
    name: 'User',
    description: 'This represents a Person',

    fields: () =>({
        id: {
            type:graphql.GraphQLInt,
            resolve(user) {
                return user.id
            }
        },
        password: {
            type: graphql.GraphQLString,
            resolve(user){
                return user.email
            }
        },
        lastName: {
            type: graphql.GraphQLString,
            resolve(user){
                return user.password
            }
        }
    })
})
const AuthData = new graphql.GraphQLObjectType({
    name: 'AuthData',
    description: 'This represnts an AuthData',

    fields: () => ({
        userId: {
            type:graphql.GraphQLInt,
            resolve(authData){
                return authData.userId
            }
        },
        token: {
            type: graphql.GraphQLString,
            resolve(authData){
                return authData.token
            }
        }
        
    })
})
const Query = new graphql.GraphQLObjectType({
    name: 'Query',
    description: 'This is a root query',
    fields: () =>{
        return{
            people:{
                type: new graphql.GraphQLList(Person),
                args:{
                    id:{
                        type: graphql.GraphQLInt
                    },
                    email:{
                        type: graphql.GraphQLString
                    }
                },
                resolve(root,args){
                    return Db.Person.findAll({where:args})
                }
            },
            posts:{
                type: new graphql.GraphQLList(Post),
                resolve(root,args){
                    return Db.Post.findAll({
                        include: [
                            Db.Person
                        ]
                    }
                    )}

            },
            users:{
                type: new graphql.GraphQLList(User),
                resolve(root,args,req){
                    if(!req.isAuth){
                        throw new Error('Unauthenticated!');
                    }
                    return Db.User.findAll()
                }
            },
            login:{
                type: AuthData,
                args: {
                    email:{
                        type: graphql.GraphQLString
                    },
                    password:{
                        type: graphql.GraphQLString
                    }
                },
             async resolve(root,args){
                    const user = await Db.User.findOne({email: args.email})
                    console.log(args.password)
                    console.log(args.email)
                    console.log("---------------------------")
                    if(!user){
                        throw new Error('User does not exist')
                    }
                    if(user.password != args.password){
                        throw new Error('Password is incorrect!')
                    }
                    const token = jwt.sign({userId: user, email: user.email}, 'secretkey',{
                        expiresIn: '3h'
                    });
                    
                    return {userId: user.id,token: token}

                }
            }

        }
    }
});
const Mutation = new graphql.GraphQLObjectType({
    name: 'Mutation',
    description: 'Functions to create stuff',
    fields(){
        return {
            addPerson:{
                type:Person,
                args: {
                    firstName:{
                        type:graphql.GraphQLString
                    },
                    lastName:{
                        type:graphql.GraphQLString
                    },
                    email:{
                        type:graphql.GraphQLString
                    }
                },
                resolve(root, args){
                    return Db.Person.create({
                        firstName: args.firstName,
                        lastName: args.lastName,
                        email: args.email
                    })
                }
            },
            addUser:{
                type:User,
                args:{
                    email:{
                        type: graphql.GraphQLString
                    },
                    password:{
                        type:graphql.GraphQLString
                    }
                },
                resolve(root,args){
                    return Db.User.create({
                        email: args.email,
                        password: args.password
                    })
                }
            },

            updatePost:{
                type: INTEGER,
                args:{
                    
                    ttile:{
                        type: graphql.GraphQLString
                    },
                    updatedContent:{
                        type: graphql.GraphQLString
                    }
                },
                  resolve(root,args){
                    return Db.Post.update({ttile: args.ttile, content: args.updatedContent},{
                        where:{ttile: args.ttile}
                    })

                    
                }
            }
        
        }
    }
})

const Schema = new graphql.GraphQLSchema({
    query: Query,
    mutation: Mutation
})

module.exports = {Schema}