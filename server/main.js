import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { HTTP } from 'meteor/http'

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
import { CurrentQuestion } from '../collections/currentQuestion';
import { Questions } from '../collections/question';

import './configureMailService';
const login = require("facebook-chat-api");

// process.env.MAIL_URL = 'smtp://sanghuynhnt95@gmail.com:1235813211995@smtp.gmail.com:587/';
//
// var VertificateCode = '';
//
// // Meteor.methods({
// //       sendEmail: function (mailAddress, mailService) {
//         VertificateCode = (Math.floor(Math.random()*99999) + 10000).toString();
//
//         //khởi tạo đối tượng mã hóa
//         var Cryptr = require('cryptr'),
//         cryptr = new Cryptr('ntuquiz123');
//
//         //mã hóa mật khẩu
//         var content;
//         // if(mailService)
//         //   content = '{"code": ' + '"' + '0123456' + '", ' + '"email": ' + '"' + 'huynhngocsangth2ntu@gmail.com' + '", ' + '"mailService": ' + mailService + '}';
//         // else
//           content = '{"code": ' + '"' + '0123456' + '", ' + '"email": ' + '"' + 'huynhngocsangth2ntu@gmail.com' + '"}';
//
//
//
//         //nội dung sau khi mã hóa
//         var encryptedString = cryptr.encrypt(content);
//
//         //chuyen huong den template
//         SSR.compileTemplate('emailText', Assets.getText("vertificateMail.html"));
//
//         //chuyen html
//         var html = SSR.render("emailText", {text:encryptedString, userId: 'abcedfghi'});
//
//         //nội dung mail
//         var email = {
//           from: 'sanghuynhnt95@gmail.com',
//           to: 'huynhngocsangth2ntu@gmail.com',
//           subject: "test email",
//           html: html
//         };
//
//         //gửi mail
//         Email.send(email);
//   //     }
//   // });

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
  Meteor.publish('questions', function(){
    return Questions.find({});//note
  });
}

// login({email: 'huynhngocsangth2ntu@gmail.com', password: '1235813211995'}, (err, api) => {
//     if(err) return console.error(err);
//
//     var yourID = "100002319334914";
//     var msg = "Hey!";
//     api.sendMessage(msg, yourID);
// });


const GRAPHQL_PORT = 8080;
const WS_PORT = 8090;

import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';
__     = require('lodash');
moment = require('moment');
Meteor.startup(function () {
  if(!Questions.findOne({_id: 'currentQuestion'})) {
    Questions.insert({
      _id : "currentQuestion",
      questionId: "",
      question : "",
      answerSet : [],
      correctAnswer : [],
      isPublic : false,
      subjectId : '',
      createdAt : '',
      createdById : '',
    });
  }
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

// const graphQLServer = express().use('*', cors());
//
// //config graphql
// graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress({
//   schema,
//   context: {},
// }));
//
// graphQLServer.use('/graphiql', graphiqlExpress({
//   endpointURL: '/graphql',
// }));
//
// graphQLServer.listen(GRAPHQL_PORT, () => console.log(
//   `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}/graphql`
// ));
//
// // WebSocket server for subscriptions
// const websocketServer = createServer((request, response) => {
//   response.writeHead(404);
//   response.end();
// });
//
// websocketServer.listen(WS_PORT, () => console.log( // eslint-disable-line no-console
//   `Websocket Server is now running on http://localhost:${WS_PORT}`
// ));
//
// new SubscriptionServer(
//   {
//    onConnect: async (connectionParams) => {
//      // Implement if you need to handle and manage connection
//    },
//    subscriptionManager: subscriptionManager
//   },
//   {
//    server: websocketServer
//   }
// );

Meteor.methods({
  getUserExam: (userIds) => {
    return Meteor.users.find({_id: {$in: userIds}}).fetch();
  }
})


//config not subscription
import {createApolloServer} from 'meteor/apollo';
createApolloServer({
  schema,
  graphiql: Meteor.isDevelopment,
  pretty: true,
  configServer: express().use('*', cors())
});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;
    return re.test(email);
}

// Accounts.validateNewUser(function (user) {
//   if(user.services.password) {
//     if (!user.emails[0].address || !validateEmail(user.emails[0].address))
//       throw new Meteor.Error(403, "Định dạng địa chỉ mail không đúng");
//     if(!user.profile.name || user.profile.name.length < 6)
//       throw new Meteor.Error(403, "Định dạng tên người dùng không đúng");
//     if (!user.profile.old || user.profile.old > 150 || user.profile.old < 7)
//       throw new Meteor.Error(403, "Định dạng tuổi không đúng");
//     if(!user.profile.address)
//       throw new Meteor.Error(403, "Định dạng địa chỉ không đúng");
//   }
//   return true;
// });

Accounts.onCreateUser(function(options, user) {
  if(user.services.password) {
    user.vertificateCode = options.vertificateCode;
    user.profile = {};
    user.profile.name = options.name;
    user.profile.old = options.old;
    user.profile.gender = options.gender;
    user.profile.address = options.address;
    user.profile.phone = options.phone;
    user.profile.picture = 'images/icon-person-128.png';
    user.friendList = []
  }
  return user;
});
