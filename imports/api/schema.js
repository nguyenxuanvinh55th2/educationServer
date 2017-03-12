import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';

const schema = [`
  type Activity {
  	_id: String,
  	topicId: String,
  	topic: Topic
  }

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

  type Course {
  	_id: String,
  	subjectName: String,
  	dateStart: String,
  	dateEnd: String,
  	isOpen: Boolean,
  	publicActivity: Boolean,
  	activity: [Activity]
  }

  type CourseTheme {
    _id: String,
    name: String,
    dateStart: Float,
    dateEnd: Float
  }

  type File {
  	index:Int,
  	ownerId: String,
  	owner: User,
  	filename:String,
  	filetype : String,
  	link : String
  }

  type MemberReply {
  	_id:String,
  	ownerId:String,
  	owner: User,
  	content: String,
  	files:[File],
  	createAt:String,
  	index: String
  }

  type Subject {
  	_id: String,
  	name: String,
  	ownerId: String,
  	owner: User,
  	createAt: Float
  	courses: [Course]
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

  type UserClass {
  	userId: String,
  	createrOf: [Class],
  	teacherOf: [Class],
  	studentOf: [Class],
  }

  type Topic {
  	_id: String,
  	type: String,
  	ownerId: String,
  	owner: User,
  	title : String,
  	content: String,
  	createAt: String,
  	dateStart: String,
  	index: String,
  	dateEnd: String,
  	files : [File],
  	memberReply: [MemberReply]
  }

  type Class {
    _id: String
    code: String
    name: String
    currentUserId: String
    currentUser: User
    role: String
    createAt: Float
    createrId: String
    courses: [Course]
    teacher: [User]
    student: [User]
  }

  type Query {
    userChat(userId: String): [UserChat],
    userClass(userId: String): UserClass,
    users: [User],
    getBackgroundList: [Background],
    getClassInfo(classId: String, userId: String, role: String): Class
    subjects: [Subject],
    courseThemes: [CourseTheme],
    classInfo(classId: String, userId: String, role: String): Class
  }

  type Mutation {
    insertAcc: String
    addClass(userId: String!, classItem: String!, subject: String!, courseTheme: String!): String
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
