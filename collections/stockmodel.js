import { Mongo } from 'meteor/mongo';

StockModels = new Mongo.Collection('stockModels');
StockModels.allow({
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
