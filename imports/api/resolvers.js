import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import moment from 'moment';
import async from 'async';
var fs = require('fs');

import { Players } from '../../collections/player'
import { UserExams } from '../../collections/userExam'
import { Examinations } from '../../collections/examination'
import Fiber from 'fibers';

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

const sendNotification = (userId, createdById, note, type, classId) => {
  note = {
    userId,
    classId,
    type,
    createdById,
    note,
    read: false,
    createAt: moment().valueOf()
  }
  Notifications.insert(note);
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
  if (query) {
    var user = {
      _id: query._id,
      name: query.profileObj ? query.profileObj.name : query.name ? query.name : query.username,
      image: '',
      email: query.profileObj ? query.profileObj.email : query.email ? query.email : query.emails[0].address,
      social: query.googleId ? 'https://plus.google.com/u/0/' + query.googleId + '/posts' : 'https://facebook.com/u/0/' + query.id,
      checkOutImage: query.checkOutImage
      //online: query.status.online,
      //lastLogin: getLastLogin(query.status.lastLogin.date)
    }
    if(query.profileObj && query.profileObj.imageUrl){
      user.image = query.profileObj.imageUrl
    }
    else if (query.picture) {
      user.image = query.picture.data.url
    }
    else if (query.profile && query.profile.imageId) {
      user.image = Files.findOne({_id: imageId}).link();
    }
    return user;
  }
  return;
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
          if(existsUser.profileObj && existsUser.profileObj.imageUrl){
            existsUser.image =  existsUser.profileObj.imageUrl
          }
          else if (existsUser.picture) {
            existsUser.image = existsUser.picture.data.url
          }
          else if (existsUser.profile && existsUser.profile.imageId) {
            existsUser.image = Files.findOne({_id: existsUser.profile.imageId}).link();
          }
          return JSON.stringify({
            _id: existsUser._id,
            image : existsUser.image ? existsUser.image : '',
            name: existsUser.profileObj ? existsUser.profileObj.name : existsUser.name ? existsUser.name : existsUser.username,
            email: existsUser.profileObj ? existsUser.profileObj.email : existsUser.email ? existsUser.email : existsUser.emails[0] ? existsUser.emails[0].address : ''
          });
        }
      }
      return ''
    },

    classSubjectsByTeacher: (root,{token}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        let profileIds = Profiles.find({name: 'teacher'}).map(item => item._id);
        let accIds = Permissions.find({
          userId: user._id,
          profileId: {$in: profileIds},
          isClassSubject: true
        }).map(item => item.accountingObjectId);
        let classSubjectIds = AccountingObjects.find({_id: {$in: accIds}, isClassSubject: true}).map(item => item.objectId);
        return ClassSubjects.find({_id: {$in: classSubjectIds}}).fetch();
      }
      return [];
    },
      //trả về thông báo của user tương ứng
    //------------------------------------------------------------------------------------//
    notification: (root, {token}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        return Notifications.find({userId: user._id}).fetch();
      }
      return [];
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

    questionByExam: (_, {examId}) => {
      let examination = Examinations.findOne({_id: examId});
      if(examination) {
        return QuestionSets.findOne({_id: examination.questionSetId});
      }
      return;
    },

    playerResultByUser: (_, {token, examId}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        let player = Players.findOne({userId: user._id, isUser: true});
        if(player) {
          let userExam = UserExams.findOne({examId, playerId: player._id});
          if(userExam) {
            let resultIds = userExam.result;
            return Results.find({_id: {$in: resultIds}}).fetch();
          }
          return
        }
      }
      return;
    },

      //trả  về danh sách user online và tin nhắn
    //--------------------------------------------------------------------------------------//
    userChat: (root, { userId }) => {
      //user list
      let usersList = [];

      let friendList = Meteor.users.findOne({_id: userId}) ? Meteor.users.findOne({_id: userId}).friendList : '';


      if(!friendList) {
        friendList = [];
      }
      //truy vấn trả về  thông tin cuser trong frinedList
      query = Meteor.users.find({ _id: { $in: friendList } }).fetch();
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
      return Meteor.users.find({_id: {$ne: '0'}}).fetch();
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
    },
    getSubjectByTeacher: (root, {userId}) => {
      let query = ClassSubjects.find({}).fetch();
    },
    getFriendList: (root, {userId}) => {
      return ;
    },
    examById: (_, {_id}) => {
      return Examinations.findOne({_id});
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
                Meteor.users.update({_id: user._id},{$set:{accessToken: stampedLoginToken.token}});
                user.image = '';
                if (user.profile && user.profile.imageId) {
                  user.image = Files.findOne({_id: user.profile.imageId}).link();
                }
                return JSON.stringify({
                  user: {
                    _id: user._id,
                    name: user.username,
                    email: user.emails[0] ? user.emails[0].address : '',
                    image: user.image
                  },
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
        console.log('questions ', questions);
        __.forEach(questions, item => {
          questionId = Random.id(16);
          item = JSON.parse(item);
          console.log('item ', item);
          item['_id'] = questionId;
          item['createdAt'] = moment().valueOf();
          item['createdById'] = user._id;
          QuestionHaves.insert({
            questionSetId,
            questionId,
            score: item.score
          })
          delete item.score
          Questions.insert(item);
        });
        return future.wait();
      }
    },
    addQuestionFromFile: (_, {token, questionSet, questionFile}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        questionSet = JSON.parse(questionSet);
        let future = new Future();
        questionSetId = Random.id(16);
        questionSet['_id'] = questionSetId;
        questionSet['createdAt'] = moment().valueOf();
        questionSet['createdById'] = user._id,
        QuestionSets.insert(questionSet, (err, _id) => {
          if(err) {

          } else {
              future.return(_id)
          }
        });

        let array = questionFile.split(/\r?\n/);
        __.forEach(array, (item, idx) => {
          if(item === '') {
            array.splice(idx, 1);
          }
        })
        for(i = 0; i < array.length - 1; i++) {
          let questionId = Random.id(16);
          if(array[i].indexOf('Câu') > -1) {
            let question = {
              _id: questionId,
              question: array[i],
              answerSet: [],
              correctAnswer: [],
              createdById: user._id,
              createdAt: moment().valueOf()
            }
            let j = i + 1;
            while(array[j].indexOf('Câu') < 0 && j < array.length - 1) {
              question.answerSet.push(array[j].replace(/(dapan)/gi, ''));
              if(array[j].toLowerCase().indexOf('dapan') > -1 || array[j].toLowerCase().indexOf('dapan') > -1) {
                question.correctAnswer.push(array[j].replace(/(dapan)/gi, ''));
              }
              j++;
            }
            Questions.insert(question, (err, result) => {
              if(err) {
                console.log('err ', err);
              } else {
                  console.log('result ', result);
              }
            });
            QuestionHaves.insert({
              questionSetId,
              questionId: question._id,
              score: 0
            });
          }
        }
        return future.wait();
      }
      return;
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
        let future = new Future();
        info = JSON.parse(info);
        info['createdAt'] = moment().valueOf();
        info['createdById'] = user._id;
        info['status'] = 0;
        Examinations.insert(info, (err, id) => {
          if(err) {
            console.log('insert error');
          } else {
            future.return(id);
          }
        });
        return future.wait();
      }
      return;
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
        return Classes.insert(info.class, (error, result) => {
          if(error){
            throw error;
          }
          else if(result) {
            if(info.userClasses){
              __.forEach(info.userClasses,(user,idx) => {
                sendNotification(user._id, userId, 'đã thêm bạn vào ', 'add-class-note', result);
              });
            }
            if(info.userMails && info.userMails[0]){
              //send mail
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
            let subjectId = result;
            if(info.joinCourse && info.classId && info.classSubject.courseId){
              info.classSubject.subjectId = subjectId;
              info.classSubject.classId = info.classId;
              ClassSubjects.insert(info.classSubject,(error,result) => {
                if(error){
                  throw error;
                }
                else if (result) {
                  let classSubjectId = result;
                  AccountingObjects.insert({
                    objectId: classSubjectId,
                    isClassSubject: true
                  },(error,result) => {
                    if(error){
                      throw error;
                    }
                    else if (result) {
                      let accountingObjectId = result;
                      Profiles.insert({
                        name: 'teacher',
                        roles: ['userCanManage', 'userCanView', 'userCanUploadLesson', 'userCanUploadAssignment', 'userCanUploadPoll', 'userCanuploadTest']
                      },(error,result) => {
                        if(error){
                          throw error;
                        }
                        else if (result) {
                          let profileId = result;
                          Permissions.insert({
                            userId: userId,
                            profileId: profileId,
                            accountingObjectId: accountingObjectId,
                            isClassSubject: true
                          })
                        }
                      });
                      if(info.themes){
                        __.forEach(info.themes,(theme) => {
                          if(!theme._id){
                            Themes.insert(theme,(error, result) => {
                              if(error){
                                throw error;
                              }
                              else {
                                let themeId = result;
                                Activities.insert({
                                  themeId: themeId,
                                  topicId: '',
                                  classSubjectId: classSubjectId
                                });
                              }
                            });
                          }
                          else {
                            //update activity for user
                          }
                        });
                      }
                    }
                  })
                }
              })
            }
            if(info.userSubjects){
              __.forEach(info.userSubjects,(userInfo,idx) => {
                //send Notifications
              });
            }
            if(info.userMails){
              __.forEach(info.userMails,(mail,idx) => {
                //send mail
              });
            }
          }
        })
      }
    },
    insertUserClass: (_, {token, classId}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        let userClass = {
          userId: user._id,
          classId,
          createdAt: moment().valueOf(),
          createdById: user._id
        }
        UserClasses.insert(userClass);
      }
    },
    insertUserToExam: (_, {token, examCode, link}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        let examination = Examinations.findOne({code: examCode});
        if(!examination) {
          return 'notFound';
        }
        if(examination.status === 0 || examination.status === 100) {
          return 'canNotJoin';
        }
        player = Players.findOne({userId: user._id});
        let playerId;
        if(!player) {
          playerId = Random.id(16);
          Players.insert({
            _id: playerId,
            userId: user._id,
            isUser: true
          });
        } else {
            playerId = player._id;
        }
        UserExams.insert({
          examId: examination._id,
          playerId,
          result: [],
          correctCount: 0
        });
        Meteor.users.update({_id: user._id}, {$set: {
          checkOutImage: [{
            link,
            time: moment().valueOf()
          }]
        }});
        return examination._id;
      }
      return;
    },
    deleteNotification: (_, {noteId}) => {
      Notifications.remove({_id: noteId});
      return;
    },
    startExamination: (_, {token, _id}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        let examination = Examinations.findOne({_id});
        if(examination && examination.createdById === user._id) {
          Examinations.update({_id}, {$set: {
            status: 99
          }});
        }
      }
      return;
    },
    finishExamination: (_, {token, _id}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        let examination = Examinations.findOne({_id});
        if(examination && examination.createdById === user._id) {
          Examinations.update({_id}, {$set: {
            status: 100
          }});
        }
      }
      return;
    },
    answerQuestion: (_, {token, examId, questionSetId, questionId, answer}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        let player = Players.findOne({userId: user._id});
        if(player) {
          answer = [answer];
          let userExam = UserExams.findOne({examId, playerId: player._id});
          let result = Results.findOne({questionId, _id: {$in: userExam.result}});
          let question = Questions.findOne({_id: questionId});
          let score = QuestionHaves.findOne({questionId, questionSetId}).score;
          let correctAnswer = question.correctAnswer;
          if(result) {
            Results.update({_id: result._id}, {$set: {
              answer,
              score: JSON.stringify(answer) === JSON.stringify(correctAnswer) ? score : 0,
              isCorrect:  JSON.stringify(answer) === JSON.stringify(correctAnswer)
            }});
          } else {
              let resultId = Random.id(16);
              Results.insert({
                _id: resultId,
                questionId,
                answer,
                score: JSON.stringify(answer) === JSON.stringify(correctAnswer) ? score : 0,
                isCorrect:  JSON.stringify(answer) === JSON.stringify(correctAnswer)
              })
              UserExams.update({examId, playerId: player._id}, {$push: {
                result: resultId
              }});
          }
        }
      }
      return;
    }
  },

  Activity: {
    topic(root) {
      return getTopicOfActivity(root.topicId);
    }
  },

  Content: {
    user(root) {
      return Meteor.users.findOne({_id: root.userId});
    }
  },

  Examination: {
    questionSet({questionSetId}) {
      return QuestionSets.findOne({_id: questionSetId});
    },
    createdBy({createdById}) {
      return getUserInfo(createdById);
    },
    userExams({_id}) {
      return UserExams.find({examId: _id}).fetch();
    }
  },

  User: {
    checkOutImage({checkOutImage}) {
      return checkOutImage;
    }
  },

  UserExam: {
    player({playerId}) {
      return Players.findOne({_id: playerId});
    },
    results({result}) {
      return Results.find({_id: {$in: result}}).fetch();
    }
  },

  Player: {
    user({userId}) {
      return getUserInfo(userId);
    }
  },

  Notification: {
    user({userId}) {
      return Meteor.users.findOne({_id: userId});
    },
    createdBy({createdById}) {
      return Meteor.users.findOne({_id: createdById});
    },
    classInfo({classId}) {
      if(classId) {
        return Classes.findOne({_id: classId});
      }
      return
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
      return Meteor.users.findOne({_id: root._id});
    }
  },

  Subject: {
    owner(root) {
      return Meteor.users.findOne({_id: root.ownerId});
    },
    classSubjects(root) {
      return getPublicCourseOfSubject(root._id)
    }
  },

  Topic: {
    owner(root) {
      return Meteor.users.findOne({_id: ownerId});
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
      return Meteor.users.findOne({_id: root.currentUserId});
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

  ClassSubject: {
    theme: ({_id}) => {
      let themeIds = Activities.find({classSubjectId: _id}).map(item => item.themeId);
      return Themes.find({_id: {$in: themeIds}}).fetch();
    },
    subject: ({subjectId}) => {
      return Subjects.findOne({_id: subjectId});
    },
    // activity(root) {
    //   return getActivityOfCourse(root._id);
    // },
    class({classId}) {
      return Classes.findOne({_id: classId});
    },
    teacher({teacherId}) {
      return Meteor.users.findOne({_id: teacherId});
    }
  },

  Theme: {
    activity: ({_id}) => {
      return Activities.find({themeId: _id}).map(item => item._id);
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
  Result: {
    question: ({questionId}) => {
      return Questions.findOne({_id: questionId});
    }
  },
  User :  {
    name: (root) => {
      return root.profileObj ? root.profileObj.name : root.name ? root.name : root.username ;
    },
    image: (root) => {
      if(root.profileObj && root.profileObj.imageUrl){
      return root.profileObj.imageUrl
      }
      else if (root.picture) {
      return root.picture.data.url
      }
      else if (root.profile && root.profile.imageId) {
        return Files.findOne({_id: imageId}).link();
      }
      return '';
    },
    email: (root) => {
      return root.profileObj ? root.profileObj.email : root.email ? root.email : root.emails[0] ? root.emails[0].address : '';
    },
    social: (root) => {
      return root.googleId ? 'https://plus.google.com/u/0/' + root.googleId + '/posts' : 'https://facebook.com/u/0/' + root.id;
    }
  },
  Subscription: {
    getsub: (root) => {

    }
  },

};

export default resolveFunctions;
