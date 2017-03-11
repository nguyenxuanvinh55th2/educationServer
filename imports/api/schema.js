import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';

const schema = [`
  type Background {
    _id: String
    value: String
  }

  type Content {
  	index: Int,
  	userId: String,
  	user: User,
  	message: String,
  	read: Boolean,
  	date: String
  }

  type User {
  	_id: String,
  	name: String,
  	image: String,
  	email: String,
  	social: String,
  	online: Boolean,
  	lastLogin: String
  }

  type UserChat {
  	_id: String,
  	user: User,
  	contentId: String,
  	content: [Content]
  }

  type Class {
    _id: String
  }

  type Query {
    userChat(userId: String): [UserChat],
    getBackgroundList: [Background],
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
