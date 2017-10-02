import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Email } from 'meteor/email';
import express from 'express';
import cors from 'cors';
Future = Npm.require('fibers/future');
__ = require('lodash');
moment = require('moment');

import { Accounts } from 'meteor/accounts-base';

import {createApolloServer} from 'meteor/apollo';
import schema from '/imports/data';
import bodyParser from 'body-parser';
import './publish';
createApolloServer({
  schema,
  graphiql: Meteor.isDevelopment,
  pretty: true,
  configServer: express().use('*', cors())
});
Meteor.startup(() => {
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
          },
          friendList: [],
          childrents: []
      });
      Accounts.setPassword('0', '12345678');
  }
});

Meteor.methods({
  sendMail(data){
    Email.send({
        from: data.sentMail,
        bcc: data.email,
        subject: data.title,
        html: data.html
    }, (err) => {
        if (err) {
          console.log('err ', err);
        } else {
            console.log("message send mail");
        }
    });
    return;
  },
  sendMailNotification(data){
    let users = Meteor.users.find({'profile.receivedNote': true}).fetch();
    if(users && users.length) {
      let emails = users.map(item => item.emails[0].address);
      Email.send({
        from: 'noreply.lokatech@gmail.com',
        bcc: emails,
        subject: data.title + ' từ trainghiemviet.com.vn',
        text: 'Khách hàng ' + data.content
      }, (err) => {
        if (err) {
          console.log('err ', err);
        } else {
          console.log("message send mail");
        }
      });
    }
    return;
  },
  sendNotification(data) {
    let users = Meteor.users.find({'profile.receivedNote': true}).fetch();
    if(users && users.length) {
      let userIds = users.map(item => item._id);
      Notifications.insert({
        note: data.note,
        toId: userIds,
        isRead: false,
        link: data.link,
        isManage: data.isManage,
        createdAt: moment().valueOf()
      })
    }
  },
  updateAdvertiseUser(data) {
    let advertisement = Advertisements.findOne({_id: data._id});
    console.log("data._id ", data._id);
    if(!advertisement.customers) {
      Advertisements.update({_id: data._id}, {$set: {
        customers: [data.customer]
      }});
    } else {
        Advertisements.update({_id: data._id}, {$push: {
          customers: data.customer
        }});
    }
  }
})
