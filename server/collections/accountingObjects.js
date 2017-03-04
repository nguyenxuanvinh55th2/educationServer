Meteor.publish('accountingObjects', function () {
      return AccountingObjects.find({});
});
