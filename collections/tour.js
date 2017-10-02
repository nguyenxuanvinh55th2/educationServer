import { Mongo } from 'meteor/mongo';

Tours = new Mongo.Collection('tours');
Tours.allow({
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
