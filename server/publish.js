Meteor.publish('settings', function () {
  return Settings.find({});
});
Meteor.publish('chats', function () {
  return Chats.find({});
});
Meteor.publish('users', function () {
  return Meteor.users.find({});
});
Meteor.publish('classifies', function () {
  return Classifies.find({});
});
Meteor.publish('tours', function () {
  return Tours.find({});
});
Meteor.publish('stockModels', function () {
  return StockModels.find({});
});
Meteor.publish('teamBuilding', function () {
  return TeamBuildings.find({});
});
Meteor.publish('accountingObject', function () {
  return AccountingObjects.find({});
});
Meteor.publish('posts', function () {
  return Posts.find({});
});
Meteor.publish('regions', function () {
  return Regions.find({});
});
Meteor.publish('advertisements', function () {
  return Advertisements.find({});
});
Meteor.publish('bpmCase', function () {
  return BPMCase.find({});
});
Meteor.publish('notificationsManage', function(isManage, dateStart, dateEnd) {
  return Notifications.find({
    $and: [
        {createdAt: {$gte: dateStart}},
        {createdAt: {$lte: dateEnd}}
    ],
    isManage: true,
  })
});
Meteor.publish('notifications', function() {
  return Notifications.find({isManage: {$ne: true}})
});
