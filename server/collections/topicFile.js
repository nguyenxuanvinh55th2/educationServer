Meteor.publish('topicFiles', function () {
      return TopicFiles.find({});
});
