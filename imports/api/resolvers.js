const resolveFunctions = {
  Query: {
    getBackgroundList: (root) => {
      return BackgroundLists.find({}).fetch();
    }
  },
  Mutation: {
    insertAcc: (root) => {
      return;
    }
  },

  Subscription: {
    getsub: (root) => {

    }
  },

};

export default resolveFunctions;
