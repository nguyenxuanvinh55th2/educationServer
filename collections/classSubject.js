import { Mongo } from 'meteor/mongo';
export const ClassSubjects = new Mongo.Collection('classSubjects');
ClassSubjects.allow({
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
