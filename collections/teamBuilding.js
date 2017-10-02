import { Mongo } from 'meteor/mongo';

TeamBuildings = new Mongo.Collection('teamBuildings');
TeamBuildings.allow({
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
