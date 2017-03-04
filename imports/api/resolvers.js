const resolveFunctions = {
  Query: {
    getAcc: (root) => {
      return AccountingObjects.find({}).fetch();
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
