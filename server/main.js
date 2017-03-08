import { Meteor } from 'meteor/meteor';
import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { subscriptionManager } from '../imports/api/subscription';
import schema from '../imports/api/schema';

const GRAPHQL_PORT = 8080;
const WS_PORT = 8090;

import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';
__     = require('lodash');
moment = require('moment');
Meteor.startup(function () {
    if (Meteor.users.find({}).count() === 0) {
        Meteor.users.insert({
            _id: '0',
            username: 'admin',
            emails: [
                {
                    address: 'nguyenxuanvinh55th2@gmail.com',
                    verified: false
                }
            ],
            profile:{
                permissions: []
            }
        });
        Accounts.setPassword('0', '12345678');
    }
  })
 console.log(Meteor.users.find({}).fetch());

const graphQLServer = express().use('*', cors());

//config graphql
graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress({
  schema,
  context: {},
}));

graphQLServer.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}/graphql`
));

// WebSocket server for subscriptions
const websocketServer = createServer((request, response) => {
  response.writeHead(404);
  response.end();
});

websocketServer.listen(WS_PORT, () => console.log( // eslint-disable-line no-console
  `Websocket Server is now running on http://localhost:${WS_PORT}`
));

new SubscriptionServer(
{
 onConnect: async (connectionParams) => {
   // Implement if you need to handle and manage connection
 },
 subscriptionManager: subscriptionManager
},
{
 server: websocketServer
}
);
