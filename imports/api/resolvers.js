import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import moment from 'moment';

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
    name: query.profileObj ? query.profileObj.name : query.name,
    image: query.profileObj ? query.profileObj.imageUrl : query.picture.data.url,
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
    console.log("accList ", accList);
    console.log("profileId ", proList);
    let perQuery = Permissions.find({userId: userId, accountingObjectId: {$in: accList}, profileId: {$in: proList}}).fetch();

    if(perQuery) {
      console.log("perQuery ", perQuery);
      perQuery = perQuery.map(item=> {
        return item.accountingObjectId;
      })
      console.log("perQuery id ", perQuery);
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
  let courseQuery = Courses.find({ classId: classId}).fetch();
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
  let courseQuery = Courses.find({ subjectId: subjectId, publicActivity: true}).fetch();
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
  userList = [];
  let profileQuery = Profiles.find({objectId: classId, objectType: 'class', userType: type}).fetch();
  profileQuery.forEach(item => {
    let userInfo = UserProfile.findOne({ profileId: item._id});
    let userItem = {
      _id: userInfo.userId,
      name: '',
      image: '',
      social: '',
      online: '',
      lastLogin: ''
    }
    userList.push(userItem);
  })

  userList.forEach(item => {
    let query = Meteor.users.findOne({ _id: item._id });
    item.name = query.profileObj ? query.profileObj.name : query.name;
    item.image = query.profileObj ? query.profileObj.imageUrl : query.picture.data.url;
    item.email = query.profileObj ? query.profileObj.email : query.email
    item.social = query.googleId ? 'https://plus.google.com/u/0/' + query.googleId + '/posts' : 'https://facebook.com/u/0/' + query.id;
    item.online = query.status.online;
    //userList[i].lastLogin = getLastLogin(query.status.lastLogin.date)
  })

  if(type === 'creater') {
    return userList[0];
  } else {
    return userList;
  }
}

const resolveFunctions = {
  Query: {
    classInfo: (root, {classId, userId, role}) => {
      classQuery = Classes.findOne({_id: classId});
      //console.log(classQuery);
      classItem = {
        _id: classQuery._id,
        code: classQuery.code,
        name: classQuery.name,
        currentUserId: userId,
        role: role
      }
      return classItem;
    },

    courseThemes: (root) => {
      return CourseThemes.find({}).fetch();
    },

      //trả  về danh sách user online và tin nhắn
    //--------------------------------------------------------------------------------------//
    userChat: (root, { userId }) => {

      console.log("userId ", userId);

      //user list
      let usersList = []

      let friendList = Meteor.users.findOne({_id: userId}).friendList;

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
    userClass: (root, { userId }) => {
      return { userId: userId }
    },
  },

  Mutation: {
    insertAcc: (root) => {
      return;
    },
    addClass: (_, {userId, classItem, subject, courseTheme}) => {
      let classId = Random.id(16);
      classItem = JSON.parse(classItem);
      classItem['_id'] = classId;
      classItem['createrId'] = userId,
      classItem['createAt'] = moment().valueOf();
      console.log("subject String ", subject);
      subject = JSON.parse(subject);
      console.log("subject object ", subject);
      courseTheme = JSON.parse(courseTheme);
      let user = Meteor.users.findOne({_id: userId});
      if(user) {
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
          name: 'teacher',
          roles: ['userCanManage', 'userCanView', 'userCanTeach']
        });
        Permissions.insert({
          profileId: profileId,
          userId,
          accountingObjectId: accId
        });
        if(courseTheme._id) {
          if(subject._id) {
            let course = {
              subjectId: subject._id,
              classId,
              isOpen: true,
              publicActivity: true,
              curseThemeId: courseTheme._id,
              dateStart: courseTheme.dateStart,
              dateEnd: courseTheme.dateEnd
            }
            Courses.insert(course);
          } else {
              console.log("subject ", subject);
              let subjectId = Random.id(16);
              Subjects.insert({
                _id: subjectId,
                name: subject.name,
                createrId: userId,
                createAt: moment().valueOf()
              });
              Courses.insert({
                subjectId: subjectId,
                classId,
                isOpen: true,
                publicActivity: true,
                curseThemeId: courseTheme._id,
                dateStart: courseTheme.dateStart,
                dateEnd: courseTheme.dateEnd
              });
          }
        } else {
            let courseThemeId = Random.id(16);
            CourseThemes.insert({
              _id: courseThemeId,
              name: courseTheme.name,
              createAt: moment().valueOf(),
              createrId: userId
            });
            if(subject._id) {
              let course = {
                subjectId: subject._id,
                classId,
                isOpen: true,
                publicActivity: true,
                courseThemeId,
                dateStart: courseTheme.dateStart,
                dateEnd: courseTheme.dateEnd
              }
              Courses.insert(course);
            } else {
                let subjectId = Random.id(16);
                Subjects.insert({
                  _id: subjectId,
                  name: subject.name,
                  createrId: userId,
                  createAt: moment().valueOf()
                });
                Courses.insert({
                  subjectId: subjectId,
                  classId,
                  isOpen: true,
                  publicActivity: true,
                  curseThemeId,
                  dateStart: courseTheme.dateStart,
                  dateEnd: courseTheme.dateEnd
                });
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

  Course: {
    activity(root) {
      return getActivityOfCourse(root._id);
    },
  },

  UserChat: {
    content(root) {
      var content = [];
      if(root.contentId && root.contentId !== null) {
        var query = ChatContent.find({chatId: root.contentId}).fetch();
        query.forEach(item => {
          var cont = {
            index: item.index,
            userId: item.userId,
            message: item.message,
            read: item.read,
            date: getTimeString(item.date)
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
    courses(root) {
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
    courses(root) {
      return getCourseByClass(root._id)
    }
  },

  Subscription: {
    getsub: (root) => {

    }
  },

};

export default resolveFunctions;
