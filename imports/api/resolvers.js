import { Meteor } from 'meteor/meteor';

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

const resolveFunctions = {
  Query: {
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
    getBackgroundList: (root) => {
      return BackgroundLists.find({}).fetch();
    }
  },

  Mutation: {
    insertStockModel: (_,{info}) => {
      info = JSON.parse(info);
        let imageData = {};
      let docData = info.images;
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
                console.log(fileRef._id);
              }
          }, true);
      });
      return;
    }
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

  Subscription: {
    getsub: (root) => {

    }
  },

};

export default resolveFunctions;
