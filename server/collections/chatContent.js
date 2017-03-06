Meteor.publish('chatContents', function () {
      return ChatContents.find({});
});
