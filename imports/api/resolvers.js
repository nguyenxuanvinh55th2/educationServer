import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import moment from 'moment';

Future = Npm.require('fibers/future');
import CryptoJS from "crypto-js";

const joinUserToClass = (userId, classId) => {
  let accId = Ramdom.id(16);
  AccountingObjects.insert({
    _id: accId,
    objectId: classId,
    isClass: true
  });
  let profileId = Random.id(16);
  Profiles.insert({
    _id: profileId,
    name: 'student',
    roles: ['userCanView', 'userCanUploadPoll']
  });
  Permissions.insert({
    profileId: profileId,
    userId,
    accountingObjectId: accId
  });
}

//function trả về các hoạt động ứng với một khóa học
getActivityOfCourse = (courseId) => {
  let result = [];
  actiQuery = Activities.find({courseId: courseId}).fetch();
  actiQuery.forEach(item => {
    let activity = {
      _id: item._id,
      topicId: item.topicId
    }
    result.push(activity);
  })
  return result;
}

//function trả về thông tin của một user theo userId
const getUserInfo = (userId) => {
  query = Meteor.users.findOne({_id: userId});
  var user = {
    _id: query._id,
    name: query.profileObj ? query.profileObj.name : query.name ? query.name : query.username,
    image: query.profileObj ? query.profileObj.imageUrl : query.picture ? query.picture.data.url : '',
    email: query.profileObj ? query.profileObj.email : query.email,
    social: query.googleId ? 'https://plus.google.com/u/0/' + query.googleId + '/posts' : 'https://facebook.com/u/0/' + query.id,
    //online: query.status.online,
    //lastLogin: getLastLogin(query.status.lastLogin.date)
  }
  return user
}

//function trả về danh sách lớp ứng với user tương ứng
getClassByUser = (userId, role) => {

  let accList = AccountingObjects.find({isClass: true}).fetch();
  let proList = Profiles.find({name: role}).fetch()

  if(accList.length && proList.length) {
    accList = accList.map(item => {
      return item._id
    })
    proList = proList.map(item => {
      return item._id
    });
    let perQuery = Permissions.find({userId: userId, accountingObjectId: {$in: accList}, profileId: {$in: proList}}).fetch();

    if(perQuery) {
      perQuery = perQuery.map(item=> {
        return item.accountingObjectId;
      })
      let accountingObjects = AccountingObjects.find({_id: {$in: perQuery}}).fetch();
      if(accountingObjects) {
        let objectList = accountingObjects.map(item => {
          return item.objectId;
        })
        return Classes.find({_id: {$in: objectList}}).fetch();
      }
    }
  }
  return [];
}

//function trả về các khóa học ứng với một lớp
getCourseByClass = (classId) => {
  let courses = [];
  let courseQuery = ClassSubjects.find({ classId: classId}).fetch();
  courseQuery.forEach(item => {
    subjectInfo = Subjects.findOne({_id: item.subjectId})
    let course = {
      _id: item._id,
      subjectName: subjectInfo.name,
      dateStart: item.dateStart,
      dateEnd: item.dateEnd,
      isOpen: item.isOpen,
      publicActivity: item.publicActivity
    }
    courses.push(course)
  })
  return courses;
}

getPublicCourseOfSubject = (subjectId) => {
  let courses = [];
  let courseQuery = ClassSubjects.find({ subjectId: subjectId, publicActivity: true}).fetch();
  courseQuery.forEach(item => {
    subjectInfo = Subjects.findOne({_id: subjectId})
    let course = {
      _id: item._id,
      subjectName: subjectInfo.name,
      teacherId: item.teacherId,
      createAt: subjectInfo.createAt,
      dateStart: item.dateStart,
      dateEnd: item.dateEnd,
      isOpen: item.isOpen,
      publicActivity: item.publicActivity
    }
    courses.push(course)
  })
  return courses;
}

//funtion  trả về sanh sách file ứng với một topic
getFileList = (objectId) => {
  let topicFileQuery = TopicFile.find({objectId: objectId}).fetch();
  let fileList = [];
  topicFileQuery.forEach(item =>{
    let fileId = item.fileId;
    let file = File.findOne({_id:fileId});
    fileList.push({
      index: i,
      ownerId: file.ownerId,
      filename: file.fileName,
      filetype : file.fileType,
      link : file.link
    })
  })
  return fileList;
}

getMemberReply = (topicId) => {
  let replies = []
  let replyQuery = MemberReply.find({topicId: topicId}).fetch();
  replyQuery.forEach(item => {
    let reply = {
      _id: item._id,
    	ownerId: item.ownerId,
    	content: item.content,
    	createAt: getTimeString(item.createAt),
    	index: Date.parse(item.createAt)
    };
    replies.push(reply);
  })
  return replies;
}

//function trả về các user tương ứng với lớp
const getUserByClass = (classId, type) => {
  let accountingObjects = AccountingObjects.find({objectId: classId, isClass: true}).fetch().map(item => item._id);
  let profiles = Profiles.find({name: type}).fetch().map(item => item._id);
  let users = Permissions.find({profileId: {$in: profiles}, accountingObjectId: {$in: accountingObjects}}).fetch().map(item => item.userId);

  let userList = Meteor.users.find({_id: {$in: users}}).fetch();

  if(type === 'creater' || type === 'teacher') {
    return userList[0];
  } else {
    return userList;
  }
}

const resolveFunctions = {
  Query: {
    getInfoUser(root, {token}){
      if(token){
        let existsUser = Meteor.users.findOne({accessToken: token});
        if(existsUser){
          return JSON.stringify(existsUser);
        }
      }
      return ''
    },
    classInfo: (root, {classId, userId, role}) => {
      classQuery = Classes.findOne({_id: classId});
      classItem = {
        _id: classQuery._id,
        code: classQuery.code,
        name: classQuery.name,
        currentUserId: userId,
        role: role
      }
      return classItem;
    },
    questionSetBankUser: (root, { userId }) => {
      return QuestionSets.find({'createdById' : userId}).fetch();
    },

    questionSetBankPublic: (root, { userId }) => {
      return QuestionSets.find({isPublic: true}).fetch();
    },

    questionBank: () => {
      return Questions.find({isPublic: true}).fetch();
    },

      //trả  về danh sách user online và tin nhắn
    //--------------------------------------------------------------------------------------//
    userChat: (root, { userId }) => {

      console.log("userId ", userId);

      //user list
      let usersList = [];

      let friendList = Meteor.users.findOne({_id: userId}) ? Meteor.users.findOne({_id: userId}).friendList : '';
      console.log("friend");


      if(!friendList) {
        friendList = [];
      }

      console.log("friendList ", friendList);


      //truy vấn trả về  thông tin cuser trong frinedList
      query = Meteor.users.find({ _id: { $in: friendList } }).fetch();

      console.log("query chat ", query);


      query.forEach(item => {
        let id = item._id;

        //truy vấn trả về nội dung chat với user tương ưng
        let chatQuery = ChatDatas.findOne({ members: { $all: [ userId, id ] } });

        let user = {
          _id: id,
          contentId: chatQuery ? chatQuery._id : null
        }

        usersList.push(user);
      })
      return usersList;
      //duyệt qua các user trong danh sách
    },
    users: (root) => {
      var result = [];
      query = Meteor.users.find({_id: {$ne: '0'}}).fetch();
      query.forEach(item => {
        var user = getUserInfo(item._id);
        result.push(user);
      })
      return result;
    },
    getBackgroundList: (root) => {
      return BackgroundLists.find({}).fetch();
    },
    subjects: (root) => {
      subjects = [];
      subjectQuery = Subjects.find({}).fetch();
      subjectQuery.forEach(item => {
        let subject = {
          _id: item._id,
        	name: item.name,
        	ownerId: item.createrId,
        	createAt: item.createAt
        }
        subjects.push(subject);
      })
      return subjects;
    },
    subjectByUser: (root, {token}) => {
      var hashedToken = Accounts._hashLoginToken(token);
      var user = Meteor.users.find({'services.resume.loginTokens': {$elemMatch: {hashedToken: hashedToken}}}).fetch()[0];
      return Subjects.find({createrId: user._id}).fetch();
    },
    questionBySubject: (root, {token, subjectId, type}) => {
      if(type === 'personal') {
        var hashedToken = Accounts._hashLoginToken(token);
        var user = Meteor.users.find({'services.resume.loginTokens': {$elemMatch: {hashedToken: hashedToken}}}).fetch()[0];
        var questionSetIds = QuestionSets.find({subjectId}).map(item => item._id);
        var questionIds = QuestionHaves.find({questionSetId: {$in: questionSetIds}}).map(item => item.questionId);
        if(user) {
          return Questions.find({_id: {$in: questionIds}}).fetch();
        }
      } else {
          return Questions.find({isPublic: true, subjectId}).fetch();
      }
    },
    userClass: (root, { userId }) => {
      return { userId: userId }
    },
    courses: (root) => {
      return Courses.find({}).fetch();
    },
    coursesActive: (root) => {
      return Courses.find({_id:{$in: ClassSubjects.find({}).map((item) => item.courseId)}}).fetch();
    },
    getSubjectByUserId: (root,{userId}) => {
      return Subjects.find({createrId:userId}).fetch();
    },
    getClassByUserId: (root,{userId}) => {
      return Classes.find({createrId: userId}).fetch();
    }
  },

  Mutation: {
    logoutUser: (_, {userId, token})=>{
      let future = new Future();
      if(userId && token){
        let user = Meteor.users.findOne({_id: userId});
        if(user){
          future.return(user._id);
        }
        else {
          future.return();
        }
      }
      else {
        future.return();
      }
      return future.wait();
    },
    addClass: (_, {userId, classItem, subject, course}) => {
      let classId = Random.id(16);
      classItem = JSON.parse(classItem);
      classItem['_id'] = classId;
      classItem['createrId'] = userId,
      classItem['createAt'] = moment().valueOf();
      subject = JSON.parse(subject);
      course = JSON.parse(course);
      let user = Meteor.users.findOne({_id: userId});
      if(user) {
        __.forEach(classItem.students, item =>{
          joinUserToClass(item, classId);
        })
        Classes.insert(classItem);
        let accId = Random.id(16);
        AccountingObjects.insert({
          _id: accId,
          objectId: classId,
          isClass: true
        });
        let profileId = Random.id(16);
        Profiles.insert({
          _id: profileId,
          name: 'creater',
          roles: ['userCanManage', 'userCanView', 'userCanUploadLesson', 'userCanUploadAssignment', 'userCanUploadPoll', 'userCanuploadTest']
        });
        Permissions.insert({
          profileId: profileId,
          userId,
          accountingObjectId: accId
        });
        accId = Random.id(16);
        profileId = Random.id(16);
        if(course._id) {
          if(subject._id) {
            let courseId = Random.id(16);
            let course = {
              _id: courseId,
              subjectId: subject._id,
              classId,
              isOpen: true,
              publicActivity: true,
              curseThemeId: Course._id,
              dateStart: course.dateStart,
              dateEnd: course.dateEnd
            }
            ClassSubjects.insert(course);
            AccountingObjects.insert({
              _id: accId,
              objectId: courseId,
              isCourse: true
            });
            Profiles.insert({
              _id: profileId,
              name: 'teacher',
              roles: ['userCanManage', 'userCanView', 'userCanUploadLesson', 'userCanUploadAssignment', 'userCanUploadPoll', 'userCanuploadTest']
            });
            Permissions.insert({
              profileId: profileId,
              userId,
              accountingObjectId: accId
            });
          } else {
              let subjectId = Random.id(16);
              Subjects.insert({
                _id: subjectId,
                name: subject.name,
                createrId: userId,
                createAt: moment().valueOf()
              });
              ClassSubjects.insert({
                subjectId: subjectId,
                classId,
                isOpen: true,
                publicActivity: true,
                curseThemeId: course._id,
                dateStart: course.dateStart,
                dateEnd: course.dateEnd
              });
          }
        } else {
            let courseId = Random.id(16);
            Courses.insert({
              _id: courseId,
              name: course.name,
              createAt: moment().valueOf(),
              createrId: userId
            });
            if(subject._id) {
              let course = {
                subjectId: subject._id,
                classId,
                isOpen: true,
                publicActivity: true,
                courseId,
                dateStart: course.dateStart,
                dateEnd: course.dateEnd
              }
              ClassSubjects.insert(course);
            } else {
                let subjectId = Random.id(16);
                Subjects.insert({
                  _id: subjectId,
                  name: subject.name,
                  createrId: userId,
                  createAt: moment().valueOf()
                });
                ClassSubjects.insert({
                  subjectId: subjectId,
                  classId,
                  isOpen: true,
                  publicActivity: true,
                  curseThemeId,
                  dateStart: course.dateStart,
                  dateEnd: course.dateEnd
                });
            }
        }
      }
      return;
    },
    insertChatData: (root, {token, info}) => {
      //var hashedToken = Accounts._hashLoginToken(token);
      var user = Meteor.users.find({accessToken: token}).fetch()[0];
      if(user) {
        info = JSON.parse(info);
        ChatDatas.insert(info);
      }
      return;
    },
    insertChatContent: (root, {token, info}) => {
      //var hashedToken = Accounts._hashLoginToken(token);
      var user = Meteor.users.find({accessToken: token}).fetch()[0];
      if(user) {
        info = JSON.parse(info);
        ChatContents.insert(info);
      }
      return;
    },
    updateChatContent: (root, {token, chatId}) => {
      ChatContents.update(
        { chatId },
        { $set: { read: true } },
        { multi: true }
      );
    },
    loginWithPassword: (_, {username, password})=>{
        let user = Meteor.users.findOne({username});
        if(user){
            var decrypted = CryptoJS.AES.decrypt(password, "def4ult");
            var plaintext = decrypted.toString(CryptoJS.enc.Utf8);
            let result = Accounts._checkPassword(user, plaintext);
            if(result.error){
                throw result.error;
            } else {
                let stampedLoginToken = Accounts._generateStampedLoginToken();
                Accounts._insertLoginToken(user._id, stampedLoginToken);
                Meteor.users.update({_id: user._id},{$set:{accessToken: stampedLoginToken.token}})
                return JSON.stringify({
                  user: user,
                  token: stampedLoginToken.token
                });
            }
        } else {
            throw "User not found!";
        }
    },
    loginWithGoogle: (_, {info})=>{
      let future = new Future();
      info = JSON.parse(info);
      let checkId = Meteor.users.find({googleId: info.googleId}).count();
      if(checkId === 0){
        Meteor.users.insert(info, (err) => {
          if(err) {
            console.log("message error ", err);
            future.return();
          }
          else {
            future.return(JSON.stringify({
              user: Meteor.users.findOne({googleId: info.googleId}),
              token: info.accessToken
            }));
          }
        });
      }
      else {
          Meteor.users.update({googleId: info.googleId},{$set:info},(error) => {
            if(error){
              future.return();
            }
            else {
              future.return(JSON.stringify({
                      user: Meteor.users.findOne({googleId: info.googleId}),
                      token: info.accessToken
                    }));
            }
          });
      }
      return future.wait();
    },
    loginWithFacebook: (_, {info})=>{
      let future = new Future();
      info = JSON.parse(info);
      let checkId = Meteor.users.find({userID: info.userID}).count();
      if(checkId === 0){
        Meteor.users.insert(info, (err) => {
          if(err) {
            console.log("message error ", err);
            future.return();
          }
          else {
            future.return(JSON.stringify({
              user: Meteor.users.findOne({userID: info.userID}),
              token: info.accessToken
            }));
          }
        });
      }
      else {
        Meteor.users.update({userID: info.userID},{$set:info},(error) => {
          if(error){
            future.return();
          }
          else {
            future.return(JSON.stringify({
                   user: Meteor.users.findOne({userID: info.userID}),
                   token: info.accessToken
                 }));
          }
        });
      }
      return future.wait();
    },
    insertQuestionSet: (_, {userId, questionSet, questions}) => {
      let user = Meteor.users.findOne({_id: userId});
      if(user) {
        let future = new Future();
        questionSetId = Random.id(16);
        questionSet = JSON.parse(questionSet);
        questionSet['_id'] = questionSetId;
        questionSet['createdAt'] = moment().valueOf();
        questionSet['createdById'] = user._id,
        QuestionSets.insert(questionSet, (err, _id) => {
          if(err) {

          } else {
              future.return(_id)
          }
        });
        __.forEach(questions, item => {
          questionId = Random.id(16);
          item = JSON.parse(item);
          item['_id'] = questionId;
          item['createdAt'] = moment().valueOf();
          item['createdById'] = user._id;
          Questions.insert(item);
          QuestionHaves.insert({
            questionSetId,
            questionId,
            score: item.score
          })
        });
        return future.wait();
      }
    },
    insertQuestionFromBank: (_, {token, questionSet, questions}) => {
      var hashedToken = Accounts._hashLoginToken(token);
      var user = Meteor.users.find({'services.resume.loginTokens': {$elemMatch: {hashedToken: hashedToken}}}).fetch()[0];
      if(user) {
        let future = new Future();
        questionSetId = Random.id(16);
        questionSet = JSON.parse(questionSet);
        questionSet['_id'] = questionSetId;
        questionSet['createdAt'] = moment().valueOf();
        questionSet['createdById'] = user._id,
        QuestionSets.insert(questionSet, (err, _id) => {
          if(err) {

          } else {
              future.return(_id)
          }
        });
        __.forEach(questions, item => {
          item = JSON.parse(item);
          QuestionHaves.insert({
            questionSetId,
            questionId: item._id,
            score: item.score
          })
        });
        return future.wait();
      }
      return;
    },
    insertExamination: (_, {userId, info}) => {
      let user = Meteor.users.findOne({_id: userId});
      if(user) {
           info = JSON.parse(info);
           info['createdAt'] = moment().valueOf();
           item['createdById'] = user._id;
      }
      return
    },
    insertCourse: (_,{userId,info}) => {
      let user = Meteor.users.findOne({_id: userId});
      if(user){
        info = JSON.parse(info);
        info.createdAt = moment().valueOf();
        info.createdById = user._id;
        return Courses.insert(info);
      }
      return ''
    },
    insertClass: (_,{userId,info}) => {
      let user = Meteor.users.findOne({_id: userId});
      if(user){
        info = JSON.parse(info);
        info.class.createdAt = moment().valueOf();
        info.class.createdById = user._id;
        info.class.createrId = user._id;
        return Classes.insert(info.class,(error, result) => {
          if(error){
            throw error;
          }
          else if(result) {
            if(info.userClasses){
              //add notification
              __.forEach(info.userClasses,(user,idx) => {
                Notifications.insert({

                })
              });
            }
          }
        });
      }
      return ''
    },
    insertSubject: (_,{userId,info}) => {
      let user = Meteor.users.findOne({_id: userId});
      if(user){
        info = JSON.parse(info);
        return Subjects.insert(info.subject,(error, result) =>{
          if(error){
            throw error;
          }
          else if (result) {
            let subjectId = result._id;
            if(info.joinToClass){
              ClassSubjects.insert(info.classeSubject,(error,result) => {
                if(error){
                  throw error;
                }
                else if (result) {
                  let classSubjectId = result._id;
                  AccountingObjects.insert({
                    objectId: result._id,
                    isClassSubject: true
                  },(error,result) => {
                    if(error){
                      throw error;
                    }
                    else if (result) {
                      let accountingObjectId = result._id;
                      Profiles.insert({
                        name: 'manageer',
                        roles: ['userCanManage', 'userCanView', 'userCanUploadLesson', 'userCanUploadAssignment', 'userCanUploadPoll', 'userCanuploadTest']
                      },(error,result) => {
                        Permissions.insert({
                          userId: userId,
                          profileId: result._id,
                          accountingObjectId: accountingObjectId
                        })
                      });
                    }
                  })
                }
              })
            }
          }
        })
      }
    }
  },

  Activity: {
    topic(root) {
      return getTopicOfActivity(root.topicId);
    }
  },

  ClassSubject: {
    activity(root) {
      return getActivityOfCourse(root._id);
    },
  },

  Content: {
    user(root) {
      return getUserInfo(root.userId)
    }
  },

  UserChat: {
    content(root) {
      var content = [];
      if(root.contentId && root.contentId !== null) {
        var query = ChatContents.find({chatId: root.contentId}).fetch();
        query.forEach(item => {
          var cont = {
            index: item.index,
            userId: item.userId,
            message: item.message,
            read: item.read,
            date: item.date
          }
          content.push(cont);
        })
      }
      return content;
    },
    user(root) {
      return getUserInfo(root._id)
    }
  },

  Subject: {
    owner(root) {
      return getUserInfo(root.ownerId)
    },
    classSubjects(root) {
      return getPublicCourseOfSubject(root._id)
    }
  },

  Topic: {
    owner(root) {
      return getUserInfo(root.ownerId)
    },
    files(root) {
      return getFileList(root._id)
    },
    memberReply(root) {
      return getMemberReply(root._id)
    }
  },

  UserClass: {
    createrOf(root) {
      return getClassByUser(root.userId, 'creater');
    },
    teacherOf(root) {
      return getClassByUser(root.userId, 'teacher');
    },
    studentOf(root) {
      return getClassByUser(root.userId, 'student');
    }
  },

  Class: {
    currentUser(root) {
      return getUserInfo(root.currentUserId);
    },
    teacher(root) {
      return getUserByClass(root._id, 'teacher');
    },
    student(root) {
      return getUserByClass(root._id, 'student');
    },
    classSubjects(root) {
      return getCourseByClass(root._id)
    }
  },
  Course: {
    classes: ({_id}) => {
      return Classes.find({_id: ClassSubjects.find({courseId: _id}).map((item) => item._id)}).fetch();
    },
    classSubjects: ({_id}) => {
      return ClassSubjects.find({courseId: _id}).fetch();
    }
  },
  QuestionSet: {
    questions:  ({_id}) => {
      let questionHaves = QuestionHaves.find({questionSetId: _id}).map(item => item.questionId);
      return Questions.find({_id: {$in: questionHaves}}).fetch();
    }
  },
  Subscription: {
    getsub: (root) => {

    }
  },

};

export default resolveFunctions;
