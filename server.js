const express = require('express')
const graphHTTP = require('express-graphql').graphqlHTTP;
const Schema = require('./schema/schema')
const bodyParser = require('body-parser')
const app = express();

const jwt = require('jsonwebtoken');
const isAuth = require('./middleware/is-auth');

app.use('/graphql',bodyParser.json(),graphHTTP({
    schema: Schema.Schema,
    pretty: true,
    graphiql: true
}));
app.use(isAuth);
app.listen(8001, () =>{
    console.log('App listenting')
})