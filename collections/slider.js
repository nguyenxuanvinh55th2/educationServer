import { Mongo } from 'meteor/mongo';

Sliders = new Mongo.Collection('sliders');
Sliders.allow({
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
