import { Mongo } from 'meteor/mongo';

BPMCase = new Mongo.Collection('bpmCase');
BPMCase.allow({
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
