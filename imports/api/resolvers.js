import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Email } from 'meteor/email';
import { HTTP } from 'meteor/http'
import moment from 'moment';
import async from 'async';
var fs = require('fs');

import { Players } from '../../collections/player'
import { UserExams } from '../../collections/userExam'
import { Examinations } from '../../collections/examination'
import { Questions } from '../../collections/question'
import { ClassSubjects } from '../../collections/classSubject'
import { ChatContents } from '../../collections/chatContent'

import Fiber from 'fibers';

Future = Npm.require('fibers/future');
import CryptoJS from "crypto-js";

// process.env.MAIL_URL = 'smtp://tuielearning@gmail.com:elearning@smtp.gmail.com:587/';
// import '../../server/secrets.js';

const sendEmail = (mailAddress, VertificateCode, userId) => {

    //VertificateCode = (Math.floor(Math.random()*99999) + 10000).toString();

    //khởi tạo đối tượng mã hóa
    var Cryptr = require('cryptr'),
    cryptr = new Cryptr('ntuquiz123');

    //mã hóa mật khẩu
    var content;
    // if(mailService)
    //   content = '{"code": ' + '"' + '0123456' + '", ' + '"email": ' + '"' + 'huynhngocsangth2ntu@gmail.com' + '", ' + '"mailService": ' + mailService + '}';
    // else
      content = '{"code": ' + '"' + VertificateCode + '", ' + '"email": ' + '"' + mailAddress + '"}';



    //nội dung sau khi mã hóa
    var encryptedString = cryptr.encrypt(content);

    //chuyen huong den template
    SSR.compileTemplate('emailText', Assets.getText("vertificateMail.html"));

    //chuyen html
    var html = SSR.render("emailText", {text:encryptedString, userId: userId});

    //nội dung mail
    // var email = {
    //   to: mailAddress,
    //   from: 'sanghuynhnt95@gmail.com',
    //   subject: "test email",
    //   html: html
    // };

    var postURL = process.env.MAILGUN_API_URL + '/' + process.env.MAILGUN_DOMAIN + '/messages';
    var options =   {
        auth: "api:" + process.env.MAILGUN_API_KEY,
        params: {
            "from":"Movie at My Place <info@movieatmyplace.com>",
            "to":[mailAddress],
            "subject": 'movieatmyplace.com quick feedback',
            "html": html,
        }
    }

    var onError = function(error, result) {
        if(error) {console.log("Error: " + error)}
    }

    // Send the request
    Meteor.http.post(postURL, options, onError);

    //gửi mail
    //Email.send(email);
}

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
      image: 'https://i1249.photobucket.com/albums/hh508/nguyenxuanvinhict/logofn1_zpswndf0chm.png',
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
      user.image = query.picture.data.url;
    } else if(query.profile && query.profile.image) {
      user.image = query.profile.image;
    } else if (query.profile && query.profile.imageId) {
      user.image = Files.findOne({_id: query.profile.imageId}).link();
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
          else if (existsUser.profile) {
            existsUser.image = existsUser.profile.image
          }
          return JSON.stringify({
            _id: existsUser._id,
            image : existsUser.image ? existsUser.image : '',
            name: existsUser.profileObj ? existsUser.profileObj.name : existsUser.name ? existsUser.name : existsUser.username,
            email: existsUser.profileObj ? existsUser.profileObj.email : existsUser.email ? existsUser.email : existsUser.emails[0] ? existsUser.emails[0].address : '',
            firstName: existsUser.profile.firstName,
            lastName: existsUser.profile.lastName
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
        }).map(item => item.accountingObjectId);
        let classSubjectIds = AccountingObjects.find({_id: {$in: accIds}, isClassSubject: true}).map(item => item.objectId);
        return ClassSubjects.find({_id: {$in: classSubjectIds}}).fetch();
      }
      return [];
    },
    classSubjectsByStudent: (root,{userId}) => {
      let user = Meteor.users.findOne({_id: userId});
      if(user) {
        let profileIds = Profiles.find({name: 'student'}).map(item => item._id);
        let accIds = Permissions.find({
          userId: user._id,
          profileId: {$in: profileIds},
        }).map(item => item.accountingObjectId);
        let classSubjectIds = AccountingObjects.find({_id: {$in: accIds}, isClassSubject: true}).map(item => item.objectId);
        return ClassSubjects.find({_id: {$in: classSubjectIds}}).fetch();
      }
      return [];
    },
    getRolesUserClass: (root,{userId, objectId}) => {
      let accounting = AccountingObjects.findOne({objectId: objectId});
      if(accounting && accounting._id){
        let permission = Permissions.findOne({userId: userId, accountingObjectId: accounting._id});
        if(permission && permission.profileId){
          return Profiles.findOne({_id: permission.profileId})
        }
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
      return QuestionSets.find({'createdById' : userId}, {createAt: -1}).fetch();
    },

    questionSetBankPublic: (root, { userId }) => {
      return QuestionSets.find({isPublic: true}, {createAt: -1}).fetch();
    },

    questionBank: () => {
      return Questions.find({isPublic: true}, {createAt: -1}).fetch();
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

    examinationByQuestionSet: (_, {_id}) => {
      return Examinations.find({questionSetId: _id}, {createAt: -1}).fetch();
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
          isFriend: true,
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
      return Subjects.find({"createrId": user._id}).fetch();
    },
    questionBySubject: (root, {token, subjectId, type}) => {
      if(type === 'personal') {
        var hashedToken = Accounts._hashLoginToken(token);
        var user = Meteor.users.find({'services.resume.loginTokens': {$elemMatch: {hashedToken: hashedToken}}}).fetch()[0];
        var questionSetIds;
        if(subjectId !== 'other') {
          questionSetIds = QuestionSets.find({subjectId}).map(item => item._id);
        } else {
            questionSetIds = QuestionSets.find({subjectId: ''}).map(item => item._id);
        }
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
    },
    getForumBySubject: (root, {subjectId}) => {
      return Topics.find({subjectId: subjectId, isForum: true}).fetch();
    },
    examByUser: (root, {token}) => {
      var user = Meteor.users.find({accessToken: token}).fetch()[0];
      if(user) {
        return Examinations.find({createdById: user._id}).fetch();
      }
      return
    },
    user: (root, {userId}) => {
      return Meteor.users.findOne({_id: userId});
    },
    getActivityForum: (root, {classSubjectId}) => {
      return Activities.find({classSubjectId: classSubjectId, isForum: true}).fetch()
    },
    getActivityAssignment: (root, {classSubjectId}) => {
      return Activities.find({classSubjectId: classSubjectId, isAssignment: true}).fetch()
    },
    getActivityTheme: (root, {classSubjectId}) => {
      return Activities.find({classSubjectId: classSubjectId, isTheme: true}).fetch()
    },
    questionSetById: (_, {_id}) => {
      return QuestionSets.findOne({_id});
    },
    getUserByClassSucbject: (root, {classSubjectId}) => {
      let userIds = [];
      let accounting = AccountingObjects.findOne({objectId: classSubjectId});
      if(accounting && accounting._id){
        let permission = Permissions.find({accountingObjectId: accounting._id}).fetch();
        if(permission && permission.length){
          __.forEach(permission,(per) => {
            let profile = Profiles.findOne({_id: per.profileId});
            if(profile && profile.name && profile.name == 'student'){
              userIds.push(per.userId);
            }
          })
        }
        return Meteor.users.find({_id: {$in: userIds}}).fetch();
      }
      return [];
    },
    getTeacherByClassSubject: (_,{classSubjectId}) => {
      let userIds = [];
      let accounting = AccountingObjects.findOne({objectId: classSubjectId});
      if(accounting && accounting._id){
        let permission = Permissions.find({accountingObjectId: accounting._id}).fetch();
        if(permission && permission.length){
          __.forEach(permission,(per) => {
            let profile = Profiles.findOne({_id: per.profileId});
            if(profile && profile.name && profile.name == 'teacher'){
              userIds.push(per.userId);
            }
          })
        }
        return Meteor.users.find({_id: {$in: userIds}}).fetch();
      }
      return [];
    },
    getAllPlayperExamByUser: (_,{userId}) => {
      let players = Players.find({userId: userId}).map((item) => item._id);
      if(players.length){
        return Examinations.find({_id: {$in: UserExams.find({playerId: {$in: players}}).map((item) => item.examId)}}).fetch();
      }
    },
    getInfoClassSubject: (_, { classSubjectId }) => {
      return ClassSubjects.findOne({_id: classSubjectId})
    },
    getAllUserFriendInClass: (_, {userIds}) => {
      let future = new Future();
      future.return(Meteor.users.find({_id: {$in: userIds}}).fetch());
      return future.wait();
    },
    getInfoTopic: (_, {_id}) => {
      return Topics.findOne({_id: _id});
    },
    getPermissonInAccounting: (_, {userIds, accountingObjectId}) => {
      return Permissions.find({userId: {$in: userIds}, accountingObjectId: accountingObjectId}).fetch();
    },
    friendList: (_, {userId}) => {
      let user = Meteor.users.findOne({_id: userId});
      if(user) {
        let friendList = user.friendList;
        return Meteor.users.find({_id: {$in: friendList}}).fetch();
      }
      return []
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
    register: (_, {info}) => {
      info = JSON.parse(info);
      let VertificateCode = (Math.floor(Math.random()*99999) + 10000).toString();
      info['vertificateCode'] = VertificateCode;
      info.frinedList =[];
      info.childrents = [];
      Accounts.createUser(info);
      let user = Meteor.users.findOne({username: info.username});
      sendEmail(info.email, VertificateCode, user._id);
      return;
    },
    authenticateUser: (_,{token, info}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        info = JSON.parse(info);
        if(info.code === user.vertificateCode) {
            Meteor.users.update({'_id': user._id, 'emails.address': user.emails[0].address}, {$set: {'emails.$.verified': true}});
        }
      }
    },
    getExistUserName: (_, {value}) => {
      return Meteor.users.findOne({username: value});
    },
    getExistEmail: (_, {value}) => {
      return Meteor.users.findOne({$or: [{emails: { $elemMatch: { address: value } }}, {'profileObj.email': value}, {email: value}]});
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
        let user = Meteor.users.findOne({$or: [{username}, {emails: { $elemMatch: { address: username } }}]});
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
          let stampedLoginToken = Accounts._generateStampedLoginToken();
          info.accessToken = stampedLoginToken.token;
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
          let stampedLoginToken = Accounts._generateStampedLoginToken();
          info.accessToken = stampedLoginToken.token;
          Meteor.users.update({userID: info.userID},{$set:info},(error) => {
            if(error){
              future.return();
            }
            else {
              future.return(JSON.stringify({
                     user: Meteor.users.findOne({userID: info.userID}),
                     token: stampedLoginToken.token
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
          QuestionHaves.insert({
            questionSetId,
            questionId,
            score: item.score
          })
          delete item.score
          Questions.insert(item, (err) => {
            if(err) {
              console.log("message ", err);
            }
          });
        });
        return future.wait();
      }
    },
    removeQuestionSet: (_, {token, _id}) => {
      let user = Meteor.users.findOne({accessToken: token});
      console.log('_id ', _id);
      if(user) {
        return QuestionSets.remove({_id});
      }
      return;
    },
    removeExamination: (_, {token, _id}) => {
      let user = Meteor.users.findOne({accessToken: token});
      console.log('_id ', _id);
      if(user) {
        return Examinations.remove({_id});
      }
      return;
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
            let index = array[i].indexOf('//');
            array[i].replace(S.substring(0, index), "");
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
    searchUser: (_,{userId, keyWord}) => {
      let codition = {$regex: keyWord, $options: 'iu'};
      let user = Meteor.users.findOne({_id: userId});
      let usersList = [];
      Meteor.users.find({$or: [{'username': codition}, {'name': codition}, {'profileObj.name': codition}]}).map(item => {
        let id = item._id;

        //truy vấn trả về nội dung chat với user tương ưng
        let chatQuery = ChatDatas.findOne({ members: { $all: [ userId, id ] } });
        let ob = {
          _id: id,
          isFriend: __.find(user.friendList, item => item === id) ? true : false,
          isChildren: __.find(user.childrents, item => item === id) ? true : false,
          contentId: chatQuery ? chatQuery._id : null
        }

        usersList.push(ob);
      });
      return usersList;
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
              // info.classSubject.code = (Math.floor(Math.random()*99999) + 10000).toString();
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
                      if(info.userSubjects){
                        __.forEach(info.userSubjects,(userInfo,idx) => {
                          Profiles.insert({
                            name: 'student',
                            roles: ['userCanView', 'userCanUploadPoll',]
                          },(error,result) => {
                            if(error){
                              throw error;
                            }
                            else if (result) {
                              Permissions.insert({
                                userId: userInfo,
                                profileId: result,
                                accountingObjectId: accountingObjectId,
                              })
                            }
                          });
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
              })
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
    screenShot: (_, {token, link}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        if(user.checkOutImage.length <= 4) {
          Meteor.users.update({_id: user._id}, {$push: {
            checkOutImage: {
              link,
              time: moment().valueOf()
            }
          }});
        }
      }
      return
    },
    deleteNotification: (_, {noteId}) => {
      Notifications.remove({_id: noteId});
      return;
    },
    readyExamination: (_, {token, _id}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        let examination = Examinations.findOne({_id});
        if(examination && examination.createdById === user._id) {
          Examinations.update({_id}, {$set: {
            status: 1
          }});
        }
      }
      return;
    },
    startExamination: (_, {token, _id}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        let examination = Examinations.findOne({_id});
        if(examination && examination.createdById === user._id) {
          Examinations.update({_id}, {$set: {
            status: 99,
            timeStart: moment().valueOf()
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
          if(JSON.stringify(answer) === JSON.stringify(correctAnswer)) {
            Questions.update({_id: questionId}, {$set: {
              anserCount: question.anserCount + 1,
              correctCount: question.correctCount + 1,
              correctRate: (question.correctCount + 1) / (question.anserCount + 1)
            }});
          } else {
              Questions.update({_id: questionId}, {$set: {
                anserCount: question.anserCount + 1,
                correctRate: (question.correctCount + 1) / (question.anserCount + 1)
              }});
          }
        }
      }
      return;
    },
    insertTopic: (_,{token, info}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        info = JSON.parse(info);
        info.data.createdAt = moment().valueOf();
        info.data.createdById = user._id;
        info.data.ownerId = user._id;
        // info.data.files = info.files;
        return Topics.insert(info.data,(error,result) => {
          if(error){
            throw error;
          }
          else {
            let docData = info.files;
            let imageData = {};
            __.forEach(docData, (content, key)=>{
                if(content.fileName){
                    imageData[key] = content;
                    imageData[key].file = content.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
                    content = '';
                }
            });
            __.forEach(imageData, (img, key)=>{
                buf = new Buffer(img.file, 'base64');
                Files.write(buf, {fileName: img.fileName, type: img.type}, (err, fileRef)=>{
                    if (err) {
                      throw err;
                    } else {
                      Topics.update({ _id: result },{ $push: { files: fileRef._id }});
                    }
                }, true);
            });
            let obActive = {
              topicId: result,
              classSubjectId: info.classSubjectId,
              themeId: ''
            }
            if(info.data.isForum ){
              obActive.isForum = true;
              Activities.insert(obActive);
            }
            else if (info.data.isAssignment) {
              obActive.isAssignment = true;
              Activities.insert(obActive);
            }
            else if (info.data.isTheme) {
              if(info.theme){
                Themes.insert(info.theme,(error, result) => {
                  if(error){
                    throw error;
                  }
                  else {
                    obActive.isTheme = true;
                    obActive.themeId = result;
                    Activities.insert(obActive)
                  }
                })
              }
            }
          }
        });
      }
      return ;
    },
    insertCommentForum: (_,{token, info}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        info = JSON.parse(info);
        info.createdAt = moment().valueOf();
        info.createdById = user._id;
        info.ownerId = user._id;
        return MemberReplys.insert(info,(error) => {
            if(error){
              throw error;
            }
          })
        }
      return ;
    },
    insertMemberReply: (_, {token, info}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        info = JSON.parse(info);
        info.data.createdAt = moment().valueOf();
        info.data.createdById = user._id;
        info.data.ownerId = user._id;
        return MemberReplys.insert(info.data,(error, result) => {
            if(error){
              throw error;
            }
            else {
              let imageData ={};
              if(info.image){
                if(info.image.fileName && info.image.file){
                  imageData.file = info.image.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
                  buf = new Buffer(imageData.file, 'base64');
                  Files.write(buf, {fileName: info.image.fileName, type: info.image.type}, (err, fileRef)=>{
                          if (err) {
                            throw err;
                          } else {
                            MemberReplys.update({_id: result},{$set: {"files": [fileRef._id]}})
                          }
                      }, true);
                }
              }
            }
          })
        }
      return ;
    },
    updateCurrentQuestion: (_,{token, info}) => {
      let user = Meteor.users.findOne({accessToken: token});
      if(user) {
        info = JSON.parse(info);
        Questions.update({_id: 'currentQuestion'}, {$set: {
          questionId: info._id
        }})
      }
      return
    },
    checkCodeUser: (_, {userId, code}) => {
      let future = new Future();
      let classSubject = ClassSubjects.findOne({code: code});
      if(classSubject && classSubject._id){
        let acc = AccountingObjects.findOne({objectId: classSubject._id});
        if(acc && !Permissions.findOne({userId: userId,accountingObjectId: acc._id })){
          Profiles.insert({
            name: 'student',
            roles: ['userCanView', 'userCanUploadPoll',]
          },(error,result) => {
            if(error){
              throw error;
              future.return('')
            }
            else if (result) {
              Permissions.insert({
                userId: userId,
                profileId: result,
                accountingObjectId: acc._id,
              });
              future.return(classSubject._id);
            }
          });
        }
        else {
          future.return('duplicated')
        }
      }
      else {
        future.return('')
      }
      return future.wait();
    },
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
          else if (existsUser.profile) {
            existsUser.image = existsUser.profile.image;
          }
          return JSON.stringify({
            _id: existsUser._id,
            image : existsUser.image ? existsUser.image : '',
            name: existsUser.profileObj ? existsUser.profileObj.name : existsUser.name ? existsUser.name : existsUser.username,
            email: existsUser.profileObj ? existsUser.profileObj.email : existsUser.email ? existsUser.email : existsUser.emails[0] ? existsUser.emails[0].address : '',
            firstName: existsUser.profile.firstName,
            lastName: existsUser.profile.lastName
          });
        }
      }
      return ''
    },
    insertUserFriend(root, {userId, _id}) {
      let user = Meteor.users.findOne({_id: userId});
      let sendimage = 'https://i1249.photobucket.com/albums/hh508/nguyenxuanvinhict/userImage_zpsqz3krq9r.jpg';
      if(user.profileObj && user.profileObj.imageUrl){
        sendimage = user.profileObj.imageUrl
      }
      else if (user.picture) {
        sendimage = user.picture.data.url
      }
      else if (user.profile && user.profile.image) {
        sendimage = user.profile.image;
      }
      else if (user.profile && user.profile.imageId) {
        sendimage = Files.findOne({_id: imageId}).link();
      }
      if(user) {
        var note = {
          userId: _id,
          type: 'add-friend-note',
          sendId: user._id,
          sendname: user.profileObj ? user.profileObj.name : user.name ? user.name : user.username,
          sendimage,
          note: 'Đã gửi lời mời kết bạn',
          read: false,
          createdAt: moment().valueOf(),
          createdById: userId
        }
        Notifications.insert(note);
      }
      return;
    },
    updateFriendList(root, {userId, _id}) {
      Meteor.users.update(
        { _id: userId },
        { $push: { friendList: _id } }
      )
      Meteor.users.update(
        { _id },
        { $push: { friendList: userId } }
      )
    },
    insertChildrent(root, {userId, code}) {
      let childId = Meteor.users.findOne({code})._id;
      Meteor.users.update(
        { _id: userId },
        { $push: { childrents: childId } }
      )
    },
    removeActivity(root, {_id}) {
      return Activities.remove({_id: _id});
    },
    updateTopic(root, {_id, info}) {
      info = JSON.parse(info);
      return Topics.update({_id: _id}, {$set: info});
    },
    checkCodeClassSubject(root, {code}) {
      if(Subjects.findOne({code: code})){
        return true;
      }
      else {
        return false;
      }
    },
    updateProfile(root, {_id, info}){
      info = JSON.parse(info);
      return Profiles.update({_id: _id},{$set: info})
    },
    checkPasswordUser: (_,{token, userId, password}) => {
      var hashedToken = Accounts._hashLoginToken(token);
      var user = Meteor.users.find({'services.resume.loginTokens': {$elemMatch: {hashedToken: hashedToken}}}).fetch()[0];
      if(user && user._id == userId) {
        var decrypted = CryptoJS.AES.decrypt(password, "def4ult");
        var plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        let result = Accounts._checkPassword(user, plaintext);
        if(result.error){
          throw result.error;
        }
        else {
          return true;
        }
      }
      return false;
    },
    updateProfileUser: (_,{token,info}) => {
      var hashedToken = Accounts._hashLoginToken(token);
      var user = Meteor.users.find({'services.resume.loginTokens': {$elemMatch: {hashedToken: hashedToken}}}).fetch()[0];
      if(user) {
        info = JSON.parse(info);
        let profile = user.profile ? user.profile : {} ;
        profile.lastName = info.profile.lastName;
        profile.firstName = info.profile.firstName;
        if(profile.firstName && profile.lastName) {
            profile.fullName = profile.lastName + ' ' + profile.firstName;
        } else if(profile.firstName) {
            profile.fullName = profile.firstName;
        } else {
            profile.fullName = profile.lastName;
        }
        profile.gender = info.profile.gender;
        profile.image = info.image;
        // if(info.image.fileName){
        //   profile.image = '';
        // }
        return Meteor.users.update({_id: user._id}, { $set: { profile } },(err) => {
          if(err){
              throw err;
          }
          else {
            if(info.password && info.password.newPass){
              var decryptedNewPass = CryptoJS.AES.decrypt(info.password.newPass, "def4ult");
              var plaintextNewPass = decryptedNewPass.toString(CryptoJS.enc.Utf8);
              Accounts.setPassword(user._id, plaintextNewPass, {logout:false});
              Meteor.users.update({_id: user._id}, {$set: {"services.resume.loginTokens": []}})
            }
            let imageData = {};
            if(info.image){
              if(info.image.fileName && info.image.file){
                imageData.file = info.image.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
                buf = new Buffer(imageData.file, 'base64');
                Files.write(buf, {fileName: info.image.fileName, type: info.image.type}, (err, fileRef)=>{
                        if (err) {
                          throw err;
                        } else {
                          Meteor.users.update({_id: user._id},{$set: {"profile.image": fileRef._id}})
                        }
                    }, true);
              }
            }
          }
        });
      }
      return ;
    }
  },
  Activity: {
    topic: ({ topicId }) => {
      return Topics.findOne({_id: topicId});
    },
    theme: ({themeId}) => {
      if(themeId){
        return Themes.findOne({_id: themeId});
      }
      return ;
    }
  },

  Content: {
    user(root) {
      return Meteor.users.findOne({_id: root.userId});
    }
  },

  Examination: {
    questionSet({questionSetId, _id}) {
      let questionSet = QuestionSets.findOne({_id: questionSetId})
      questionSet['examId'] = _id;
      return questionSet;
    },
    createdBy({createdById}) {
      return getUserInfo(createdById);
    },
    userExams({_id}) {
      return UserExams.find({examId: _id}).fetch();
    }
  },

  UserExam: {
    player({playerId}) {
      return Players.findOne({_id: playerId});
    },
    results({result}) {
      return Results.find({_id: {$in: result}}).fetch();
    },
    score({result}) {
      let score = 0
      let scoreList = Results.find({_id: {$in: result}}).map(item => item.score);
      __.forEach(scoreList, item => score += item);
      return score;
    }
  },

  Player: {
    user({userId}) {
      return Meteor.users.findOne({_id: userId});
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
            _id: item._id,
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
   teacher({_id}) {
     let future = new Future();
      let accounting = AccountingObjects.findOne({objectId: _id});
      if(accounting){
        let permission = Permissions.find({accountingObjectId: accounting._id}).fetch();
        if(permission && permission.length){
          let flat = false;
          __.forEach(permission,(per) => {
            let profile = Profiles.findOne({_id: per.profileId});
            if(profile && profile.name && profile.name == 'teacher'){
              flat = true;
              future.return(Meteor.users.findOne({_id: '0'}));
            }
          })
          if(!flat){
            future.return({});
          }
        }
        else {
          future.return({});
        }
      }
      else {
        future.return({});
      }
     return future.wait();
   },
   accounting({_id}){
     return AccountingObjects.findOne({objectId: _id})
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
    questions:  ({_id, examId}) => {
      let questionHaves = QuestionHaves.find({questionSetId: _id}).map(item => item.questionId);
      let questions = Questions.find({_id: {$in: questionHaves}}).fetch()
      __.forEach(questions, item => {
        item['examId'] = examId;
        item['questionSetId'] = _id;
      });
      return questions;
    }
  },
  Question: {
    correctRateByExam: ({_id, examId}) => {
      let resultArray = UserExams.find({examId}).map(item => item.result);
      let results = [];
      __.forEach(resultArray, item => {
        results = __.concat(results, item);
      })
      return (Results.find({_id: {$in: results}, questionId: _id, isCorrect: true}).count() / resultArray.length);
    },
    correctRate: ({_id, questionSetId}) => {
      if(!questionSetId) {
        questionSetId = QuestionHaves.findOne({questionId: _id}).questionSetId;
      }
      let examIds = Examinations.find({questionSetId}).map(item => item._id);
      let resultArray = UserExams.find({examId: {$in: examIds}}).map(item => item.result);
      let results = [];
      __.forEach(resultArray, item => {
        results = __.concat(results, item);
      })
      return (Results.find({_id: {$in: results}, questionId: _id, isCorrect: true}).count() / resultArray.length);
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
    firstName: (root) => {
      return (root.profile && root.profile.firstName) && root.profile.firstName;
    },
    lastName: (root) => {
      return (root.profile && root.profile.lastName) && root.profile.lastName;
    },
    fullName: (root) => {
      return (root.profile && root.profile.fullName) && root.profile.fullName;
    },
    image: (root) => {
      if(root.profileObj && root.profileObj.imageUrl){
      return root.profileObj.imageUrl
      }
      else if (root.picture) {
      return root.picture.data.url
      }
      else if (root.profile && root.profile.image) {
        return root.profile.image;
      }
      else if (root.profile && root.profile.imageId) {
        return Files.findOne({_id: imageId}).link();
      }
      return 'https://i1249.photobucket.com/albums/hh508/nguyenxuanvinhict/userImage_zpsqz3krq9r.jpg';
    },
    email: (root) => {
      return root.profileObj ? root.profileObj.email : root.email ? root.email : root.emails ? root.emails[0].address : '';
    },
    social: (root) => {
      return root.googleId ? 'https://plus.google.com/u/0/' + root.googleId + '/posts' : 'https://facebook.com/u/0/' + root.id;
    },
    checkOutImage: ({checkOutImage}) => {
      return checkOutImage;
    },
    userFriendsUser: ({friendList}) => {
      return Meteor.users.find({_id:{$in: friendList ? friendList : []}}).fetch();
    },
    childrents: ({childrents}) => {
      return Meteor.users.find({_id:{$in: childrents ? childrents : []}}).fetch();
    }
  },
  Topic: {
    memberReply: ({_id}) => {
      return MemberReplys.find({topicId: _id}).fetch();
    },
    files: ({files}) => {
      if(files && files[0]){
        return Files.find({_id:{$in:files}}).each().map((img)=>{
                return {
                  _id: img._id,
                  file: img.link(),
                  fileName: img.name,
                  type: img.type
                };
            });
      }
      return [];
    },
    owner: ({ownerId}) => {
      return Meteor.users.findOne({_id: ownerId});
    }
  },
  MemberReply: {
    owner: ({ownerId}) => {
      return Meteor.users.findOne({_id: ownerId});
    },
    files: ({files}) => {
      if(files && files[0]){
        return Files.find({_id:{$in:files}}).each().map((img)=>{
                return {
                  _id: img._id,
                  file: img.link(),
                  fileName: img.name,
                  type: img.type
                };
            });
      }
      return [];
    },
  },
  Permission: {
    profile: ({profileId}) => {
      return Profiles.findOne({_id: profileId});
    },
    user: ({userId}) => {
      return Meteor.users.findOne({_id: userId});
    },
    accounting: ({accountingObjectId}) => {
      return AccountingObjects.findOne({_id: accountingObjectId});
    }
  },
  Subscription: {
    getsub: (root) => {

    }
  },

};

export default resolveFunctions;
