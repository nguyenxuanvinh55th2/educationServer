import {Mongo} from 'meteor/mongo';

Activity = new Mongo.Collection("activity");

Activity.allow({
  insert: function(){
    return true;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true;
  }
});
