import { Mongo } from 'meteor/mongo';

AccountingObjects = new Mongo.Collection('accountingObjects');
AccountingObjects.allow({
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
