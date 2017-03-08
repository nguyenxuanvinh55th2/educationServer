Meteor.publish('accountingObjects', function () {
      return AccountingObjects.find({});
});
Meteor.publish('activity', function () {
      return Activity.find({});
});
