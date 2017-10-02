import { Mongo } from 'meteor/mongo';

Settings = new Mongo.Collection('settings');
Settings.allow({
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
