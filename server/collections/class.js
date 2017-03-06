Meteor.publish('classes', function () {
      return Classes.find({});
});
