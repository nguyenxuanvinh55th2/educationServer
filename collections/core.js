import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';

// Images = new Mongo.Collection('images');
// Images.allow({
//     insert: function() {
//         return true;
//     },
//     remove: function() {
//         return true;
//     },
//     update: function() {
//         return true;
//     }
// });
// ImagesStores = new UploadFS.store.Local({
//     collection: Images,
//     name: 'images',
//     path: '/var/www/data/images',
//     filter: new UploadFS.Filter({
//         minSize: 1,
//         maxSize: 1024*1000*2,
//         contentTypes: ['image/*'],
//         extensions: ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG']
//     })
// });
// Meteor.users.allow({
//     insert: function(userId, doc){
//         return true;
//     },
//     remove:function(userId, document) {
//         if(document._id == userId){
//             return false;
//         } else {
//             return true;
//         }
//     },
//     update:function(userId, doc, fieldNames, modifier) {
//         return true;
//     }
// });
