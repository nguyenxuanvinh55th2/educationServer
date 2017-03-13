import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';

Meteor.users.allow({
    insert: function(userId, doc){
        return true;
    },
    remove:function(userId, document) {
        if(document._id == userId){
            return false;
        } else {
            return true;
        }
    },
    update:function(userId, doc, fieldNames, modifier) {
        return true;
    }
});
