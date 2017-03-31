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

  type ClassSubject {
  	_id: String,
  	subjectName: String,
  	dateStart: String,
  	dateEnd: String,
  	isOpen: Boolean,
  	publicActivity: Boolean,
  	activity: [Activity]
  }

  type Course {
    _id: String
    name: String
    dateStart: Float
    dateEnd: Float
    classes: [Class]
    classSubjects: [ClassSubject]
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
  	classSubjects: [ClassSubject]
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

  type Question {
    _id: String,
    question: String,
    answerSet: [String],
    correctAnswer: [String],
    correctRate: Float,
  }

  type QuestionSet {
    _id: String,
    title: String,
    description: String,
    questionCount: Int,
    questions: [Question]
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
    classSubjects: [ClassSubject]
    teacher: User
    student: [User]
  }
  type Query {
    getInfoUser(token: String): String
    userChat(userId: String): [UserChat],
    userClass(userId: String): UserClass,
    users: [User],
    getBackgroundList: [Background],
    getClassInfo(classId: String, userId: String, role: String): Class
    subjects: [Subject],
    courses: [Course],
    coursesActive: [Course],
    classInfo(classId: String, userId: String, role: String): Class
    questionSetBankUser(userId: String!): [QuestionSet]
    questionSetBankPublic: [QuestionSet]
    questionBank: [Question]
    subjectByUser(token: String!): [Subject]
    questionBySubject(token: String, subjectId: String!, type: String!): [Question]
  }

  type Mutation {
    logoutUser(userId: String, token: String): String
    insertAcc: String
    addClass(userId: String!, classItem: String!, subject: String!, course: String!): String
    insertStockModel(info: String): String
    loginWithPassword(username: String, password: String): String
    loginWithGoogle(info: String): String
    loginWithFacebook(info: String): String
    insertQuestionSet(userId: String!, questionSet: String!, questions: [String]!): String
    insertQuestionFromBank(token: String!, questionSet: String!, questions: [String]!): String
    insertExamination(userId: String!, info: String!): String,
    insertCourse(userId: String!, info: String!): String
    insertClass(userId: String!, info: String) : String
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
