import { Meteor } from 'meteor/meteor';
import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { subscriptionManager } from '../imports/api/subscription';
import schema from '../imports/api/schema';
import { Players } from '../collections/player';
import { GroupPlayers } from '../collections/groupPlayer';
import { PersonalPlayers } from '../collections/personalPlayer';
import { UserExams } from '../collections/userExam';
import { Examinations } from '../collections/examination';

// fs.readFile('../../../../../public/dethi.doc', 'utf8', function(err, data) {
//   if (err) throw err;
//   let questions = [];
//   let array = data.split(/\r?\n/);
//   for(i = 0; i < array.length - 1; i++) {
//     if(array[i].indexOf('Câu') > -1) {
//       let question = {
//         question: array[i],
//         answerSet: [],
//         correctAnswer: []
//       }
//       let j = i + 1;
//       while(array[j].indexOf('Câu') < 0 && j < array.length - 1) {
//         question.answerSet.push(array[j].replace(/(dapan)/gi, ''));
//         if(array[j].toLowerCase().indexOf('dapan') > -1 || array[j].toLowerCase().indexOf('dapan') > -1) {
//           question.correctAnswer.push(array[j]);
//         }
//         j++;
//       }
//       questions.push(question)
//     }
//   }
//   console.log('array: ', questions);
// });

if(Meteor.isServer){
  Meteor.publish('userExams', function(){
    return UserExams.find({});//note
  });
  Meteor.publish('examinations', function(){
    return Examinations.find({});//note
  });
  Meteor.publish('players', function(){
    return Players.find({});//note
  });
  Meteor.publish('groupPlayers', function(){
    return GroupPlayers.find({});//note
  });
  Meteor.publish('personalPlayers', function(){
    return PersonalPlayers.find({});//note
  });
  Meteor.publish('users', function(){
    return Meteor.users.find({});//note
  });
}

const GRAPHQL_PORT = 8080;
const WS_PORT = 8090;

import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';
__     = require('lodash');
moment = require('moment');
Meteor.startup(function () {
  // Meteor.users.insert({
  //     _id: '1',
  //     username: 'vinhict',
  //     emails: [
  //         {
  //             address: 'nguyenxuanvinhict@gmail.com',
  //             verified: true
  //         }
  //     ],
  //     profile:{
  //         permissions: []
  //     }
  // });
  // Accounts.setPassword('1', '12345678');
  // Meteor.users.insert({
  //     _id: '2',
  //     username: 'th2ict',
  //     emails: [
  //         {
  //             address: 'nguyenxuanvinh55th2ICT@gmail.com',
  //             verified: true
  //         }
  //     ],
  //     profile:{
  //         permissions: []
  //     }
  // });
  // Accounts.setPassword('2', '12345678');
    if (Meteor.users.find({}).count() === 0) {
        Meteor.users.insert({
            _id: '0',
            username: 'admin',
            emails: [
                {
                    address: 'nguyenxuanvinh55th2@gmail.com',
                    verified: true
                }
            ],
            profile:{
                permissions: []
            }
        });
        Accounts.setPassword('0', '12345678');
    }
    ServiceConfiguration.configurations.upsert(
      { service: "facebook" },
      {
        $set: {
          appId: "265492483877076",
          loginStyle: "popup",
          secret: "2b1941b986c3aaa3069931a6c3ac6cd2"
        }
      }
    );
    ServiceConfiguration.configurations.upsert(
     { service: "google" },
     {
       $set: {
         clientId: "500871646789-sutbet90ovo14nub4f2l190ck6u93cgc.apps.googleusercontent.com",
         loginStyle: "popup",
         secret: "1fdmJC5O0DZ3SiNJI3vwyMeT"
       }
     }
   );
  })

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

Meteor.methods({
  getUserExam: (userIds) => {
    return Meteor.users.find({_id: {$in: userIds}}).fetch();
  }
})
