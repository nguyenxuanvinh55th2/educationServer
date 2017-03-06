import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';

const schema = [`
  type Background {
    _id: String
    value: String
  }
  type Class {
	_id: String
}
  type Query {
    getBackgroundList: [Background]
    getClassInfo(classId: String, userId: String, role: String): Class
  }
  type Mutation {
    insertAcc: String
  }
  type Subscription {
    getsub : String
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
