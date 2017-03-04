import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';

const schema = [`
  type Acc {
    _id: String
  }
  type Query {
    getAcc : [Acc]
  }
  type Mutation {
    insertAcc: String
  }
  type Subscription {
    getsub : Acc
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`];
export default makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});
