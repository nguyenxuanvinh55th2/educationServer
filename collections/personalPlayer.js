import { Mongo } from 'meteor/mongo';

export const PersonalPlayers = new Mongo.Collection('personalPlayers');
PersonalPlayers.allow({
  insert: function () {
      // the user must be logged in, and the document must be owned by the user
      return true;
  },
  update: function () {
      // can only change your own documents
      return true;
  },
  remove: function () {
      // can only remove your own documents
      return true;
  }
});
