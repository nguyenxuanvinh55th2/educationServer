import { Mongo } from 'meteor/mongo';

export const Notifications = new Mongo.Collection('notifications');
Notifications.allow({
  insert: function () {
      return true;
  },
  update: function () {
      return true;
  },
  remove: function () {
      return true;
  }
});
