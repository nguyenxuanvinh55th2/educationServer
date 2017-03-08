Meteor.publish('memberReplys', function () {
      return MemberReplys.find({});
});
