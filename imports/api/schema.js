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
  	date: Float
  }

  type Result {
    _id: String,
    question: Question,
    answer: [String],
    score: Int,
    isCorrect: Boolean
  }

  type ClassSubject {
  	_id: String
    name: String
    teacher: User
  	subject: Subject
    class: Class
  	dateStart: String
  	dateEnd: String
  	isOpen: Boolean
  	publicActivity: Boolean
  	theme: [Theme]
  }

  type Examination {
    _id : String,
    code : String,
    createdBy: User,
    name : String,
    questionSet: QuestionSet,
    userExams: [UserExam],
    description : String,
    userCount : Int,
    time : Int,
    createdAt : Float,
    status : Int
  }

  type Player {
    _id: String,
    user: User,
    result: [Result]
    isUser: Boolean,
  }

  type Theme {
    _id: String,
    name: String,
    activity: [String]
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
    _id: String
  	index:Int
  	ownerId: String
  	owner: User
  	filename:String
  	filetype : String
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

  type Notification {
    _id: String,
    user: User,
    classInfo: Class,
    type: String,
    createdBy: User,
    note: String,
    read: Boolean,
    createdAt: Float
  }

  type Subject {
  	_id: String
    code: String
  	name: String
    description: String
  	ownerId: String
  	owner: User
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
  	lastLogin: String,
    checkOutImage: [CheckOutImage]
  }

  type CheckOutImage {
    link: String,
    time: Float
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

  type UserExam {
    _id : String,
    player : Player,
    results : [Result],
    correctCount : Int
  }

  type Topic {
  	_id: String
    isForum: Boolean
    isAssignment: Boolean
    isTheme: Boolean
  	owner: User
  	title : String
  	content: String
  	dateStart: String
  	dateEnd: String
  	files : [File]
  	memberReply: [MemberReply]
    links: [String]
    selection: [String]
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
    classSubjectsByTeacher(token: String!): [ClassSubject],
    users: [User],
    getBackgroundList: [Background],
    getClassInfo(classId: String, userId: String, role: String): Class
    subjects: [Subject],
    courses: [Course],
    coursesActive: [Course],
    classInfo(classId: String, userId: String, role: String): Class
    questionSetBankUser(userId: String!): [QuestionSet]
    questionSetBankPublic: [QuestionSet]
    questionByExam(examId: String!): QuestionSet
    questionBank: [Question]
    subjectByUser(token: String!): [Subject]
    questionBySubject(token: String, subjectId: String!, type: String!): [Question]
    getSubjectByUserId(userId: String): [Subject]
    getClassByUserId(userId: String): [Class]
    getSubjectByTeacher(userId: String): [ClassSubject]
    notification(token: String!) : [Notification]
    getFriendList (userId: String): [User]
    playerResultByUser (token: String!, examId: String!) : [Result]
    examById (_id: String!): Examination
    getForumBySubject (subjectId: String!): [Topic]
  }

  type Mutation {
    logoutUser(userId: String, token: String): String
    insertAcc: String
    addClass(userId: String!, classItem: String!, subject: String!, course: String!): String
    loginWithPassword(username: String, password: String): String
    loginWithGoogle(info: String): String
    loginWithFacebook(info: String): String
    insertQuestionSet(userId: String!, questionSet: String!, questions: [String]!): String
    insertQuestionFromBank(token: String!, questionSet: String!, questions: [String]!): String
    addQuestionFromFile(token: String!, questionSet: String!, questionFile: String!): String
    insertExamination(userId: String!, info: String!): String,
    insertCourse(userId: String!, info: String!): String
    insertClass(userId: String!, info: String) : String
    insertChatData(token: String!, info: String!) : String
    insertChatContent(token: String!, info: String!) : String
    insertSubject(userId: String!, info: String): String
    insertUserClass(token: String!, classId: String!): String
    updateChatContent(token: String!, chatId: String!) : String
    deleteNotification(noteId: String!) : String
    insertUserToExam(token: String!, examCode: String!, link: String!) : String
    startExamination(token: String!, _id: String!): String
    answerQuestion(token: String!, examId: String!, questionSetId: String!, questionId: String!, answer: String!): String
    finishExamination(token: String!, _id: String!): String
    insertForum(token: String!, info: String): String
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
