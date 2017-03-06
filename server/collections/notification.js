Meteor.publish('notifications', function () {
      return Notifications.find({});
});
