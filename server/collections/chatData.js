Meteor.publish('chatDatas', function () {
      return ChatDatas.find({});
});
