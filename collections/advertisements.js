import { Mongo } from 'meteor/mongo';

//bao gồm quảng cáo và quản lý hình ảnh
Advertisements = new Mongo.Collection('advertisements');
Advertisements.allow({
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
