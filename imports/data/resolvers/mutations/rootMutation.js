import { Random } from 'meteor/random';
import CryptoJS from "crypto-js";

const rootMutation = {
  changePassword: (_, {userId, password, oldPassword}) => {
    let user = Meteor.users.findOne({_id: userId});
    if (user) {
      var decryptedOld = CryptoJS.AES.decrypt(oldPassword, "def4ult");
      var plaintextOld = decryptedOld.toString(CryptoJS.enc.Utf8);
      var result = Accounts._checkPassword(user, plaintextOld);
      if (result.error) {
        throw "Wrong old password!";
      } else {
        var decrypted = CryptoJS.AES.decrypt(password, "def4ult");
        var plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        return Accounts.setPassword(user._id, plaintext, {logout: false});
      }
    } else {
      throw "user logged out!";
    }
  },
  updateRegionView: (_,{ _id, token }) => {
    let region = Regions.findOne({_id});
    if(region.accessToken.indexOf(token) === -1) {
      Regions.update({_id}, {$push: {
        accessToken: token
      }})
    }
    return;
  },

  insertOrUpdateAdvertise: (_, {userId, _id, info}) => {
    let user = Meteor.users.find({_id: userId});
    if(user) {
      info = JSON.parse(info);
      if(!_id) {
        let file = info.image;
        if(file.fileName) {
          file.fileName = Random.id(5) + file.fileName;
          file.file = file.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
        }
        buf = new Buffer(file.file, 'base64');
        Files.write(buf, {fileName: file.fileName, type: file.type}, (err, fileRef)=>{
            if (err) {
              throw err;
            } else {
                info.imageId = fileRef._id;
                info.createdAt = moment().valueOf();
                info.createdBy = {
                  _id: user._id,
                  username: user.username
                }
                if(info.type === 'popup' || info.type === 'countryTour' || info.type === 'foreignTour' || info.type === 'teamBuilding' || info.type === 'promotion' || info.type === 'contact') {
                  if(info.isShow) {
                    let advertisement = Advertisements.findOne({type: info.type, isShow: true});
                    if(advertisement) {
                      Advertisements.update({_id: advertisement._id}, {$set: {
                        isShow: false
                      }})
                    }
                  }
                }
                delete info.image;
                Advertisements.insert(info);
                return;
            }
        }, true);
      } else {
          if(info.type === 'popup' || info.type === 'countryTour' || info.type === 'foreignTour' || info.type === 'teamBuilding' || info.type === 'promotion' || info.type === 'contact') {
            if(info.isShow) {
              let advertisement = Advertisements.findOne({type: info.type, isShow: true});
              if(advertisement) {
                Advertisements.update({_id: advertisement._id}, {$set: {
                  isShow: false
                }})
              }
            }
          }
          if(info.image._id) {
            info.imageId = info.image._id;
            delete info.image;
            Advertisements.update({_id}, {$set: info});
          } else {
              let file = info.image;
              if(file.fileName) {
                file.fileName = Random.id(5) + file.fileName;
                file.file = file.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
              }
              buf = new Buffer(file.file, 'base64');
              Files.write(buf, {fileName: file.fileName, type: file.type}, (err, fileRef)=>{
                  if (err) {
                    throw err;
                  } else {
                      info.imageId = fileRef._id;
                      delete info.image;
                      Advertisements.update({_id}, {$set: info});
                      return;
                  }
              }, true);
          }
      }
    }
    return;
  },
  insertOrUpdateImage: (_, {userId, _id, info}) => {
    let user = Meteor.users.find({_id: userId});
    if(user) {
      info = JSON.parse(info);
      if(!_id) {
        let file = info.image;
        if(file.fileName) {
          file.fileName = Random.id(5) + file.fileName;
          file.file = file.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
        }
        buf = new Buffer(file.file, 'base64');
        Files.write(buf, {fileName: file.fileName, type: file.type}, (err, fileRef)=>{
            if (err) {
              throw err;
            } else {
                if(info.type === 'tour') {
                  Tours.update({_id: info.itemId}, {$set: {
                    imageId: fileRef._id
                  }})
                } else {
                  Classifies.update({_id: info.itemId}, {$set: {
                    imageId: fileRef._id
                  }})
                }
                info.createdAt = moment().valueOf();
                info.createdBy = {
                  _id: user._id,
                  username: user.username
                }
                let file = Files.findOne({_id: fileRef._id});
                Files.update({_id: file._id}, {$set: {
                  link: file.link(),
                  typeUse: info.type
                }});
                return;
            }
        }, true);
      } else {
          if(info.image._id) {
            if(info.type === 'tour') {
              Tours.update({_id: info.itemId}, {$set: {
                imageId: info.image._id
              }})
            } else {
              Classifies.update({_id: info.itemId}, {$set: {
                imageId: info.image._id
              }})
            }
            Files.update({_id: info.image._id}, {$set: {
              typeUse: info.type
            }});
          } else {
              let file = info.image;
              if(file.fileName) {
                file.fileName = Random.id(5) + file.fileName;
                file.file = file.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
              }
              buf = new Buffer(file.file, 'base64');
              Files.write(buf, {fileName: file.fileName, type: file.type}, (err, fileRef)=>{
                  if (err) {
                    throw err;
                  } else {
                      if(info.type === 'tour') {
                        Tours.update({_id: info.itemId}, {$set: {
                          imageId: fileRef._id
                        }})
                      } else {
                        Classifies.update({_id: info.itemId}, {$set: {
                          imageId: fileRef._id
                        }})
                      }
                      let file = Files.findOne({_id: fileRef._id});
                      Files.update({_id: file._id}, {$set: {
                        link: file.link(),
                        typeUse: info.type
                      }});
                      return;
                  }
              }, true);
          }
      }
    }
    return;
  },

  insertOrUpdateSlider: (_, {userId, _id, info}) => {
    let user = Meteor.users.find({_id: userId});
    if(user) {
      info = JSON.parse(info);
      if(!_id) {
        let file = info.image;
        if(file.fileName) {
          file.fileName = Random.id(5) + file.fileName;
          file.file = file.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
        }
        buf = new Buffer(file.file, 'base64');
        Files.write(buf, {fileName: file.fileName, type: file.type}, (err, fileRef)=>{
            if (err) {
              throw err;
            } else {
                info.imageId = fileRef._id;
                info.createdAt = moment().valueOf();
                info.createdBy = {
                  _id: user._id,
                  username: user.username
                }
                delete info.image;
                Sliders.insert(info);
                return;
            }
        }, true);
      } else {
          if(info.image._id) {
            info.imageId = info.image._id;
            delete info.image;
            Sliders.update({_id}, {$set: info});
          } else {
              let file = info.image;
              if(file.fileName) {
                file.fileName = Random.id(5) + file.fileName;
                file.file = file.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
              }
              buf = new Buffer(file.file, 'base64');
              Files.write(buf, {fileName: file.fileName, type: file.type}, (err, fileRef)=>{
                  if (err) {
                    throw err;
                  } else {
                      info.imageId = fileRef._id;
                      info.createdAt = moment().valueOf();
                      info.createdBy = {
                        _id: user._id,
                        username: user.username
                      }
                      delete info.image;
                      Sliders.update({_id}, {$set: info});
                      return;
                  }
              }, true);
          }
      }
    }
    return;
  },

  removeSlider: (_, {userId, _id}) => {
    let user = Meteor.users.find({_id: userId});
    if(user) {
      return Sliders.remove({_id});
    }
  },

  saveUser: (_, {token, info}) => {
      var hashedToken = Accounts._hashLoginToken(token);
      var user = Meteor.users.find({'services.resume.loginTokens': {$elemMatch: {hashedToken: hashedToken}}}).fetch()[0];
      if(user) {
          info = JSON.parse(info);
          if(!info._id) {
            let userByName = Meteor.users.findOne({username: info.username});
            if(userByName) {
              return 'userNameExist';
            }
            let userByMail = Meteor.users.findOne({'emails': {$elemMatch: {address: info.email}}});
            if(userByMail) {
              return 'emailExist';
            }
          }
          let profile = {
              firstName: info.firstName,
              lastName: info.lastName,
              receivedNote: info.receivedNote
          };
          if(profile.firstName && profile.lastName) {
              profile.fullName = info.lastName + ' ' + info.firstName;
          } else if(profile.firstName) {
              profile.fullName = profile.firstName;
          } else {
              profile.fullName = profile.lastName;
          }
          if(info._id){
              return Meteor.users.update({_id:info._id}, {$set:{"profile":profile}});
          } else {
              return Accounts.createUser({username: info.username, email: info.email, password: info.password, profile});
          }
      }
  },
  removeUser: (_, {token, id}) => {
      var hashedToken = Accounts._hashLoginToken(token);
      var user = Meteor.users.find({'services.resume.loginTokens': {$elemMatch: {hashedToken: hashedToken}}}).fetch()[0];
      if(user) {
          if(id === '0' || id === '1'){
              throw 'Not allow!';
          } else {
              return Meteor.users.remove(id);
          }
      }
  },
  removeAdvertise: (_, {userId, _id}) => {
    let user = Meteor.users.find({_id: userId});
    if(user) {
      return Advertisements.remove({_id});
    }
  },
  selectAdvertise: (_, {userId, _id}) => {
    let user = Meteor.users.find({_id: userId});
    if(user) {
      //let advertisement = Advertisements.find({type: 'header'})
    }
  },

  insertClassify: (_, {userId, info, image}) => {
    let future = new Future();
    let user = Meteor.users.find({_id: userId});
    if(user) {
      if(typeof info == 'string'){
        info = JSON.parse(info)
      }
      if(typeof image == 'string'){
        image = JSON.parse(image);
      }
      future.return(Classifies.insert(info, (err, res) => {
        if (err) {console.log(err);}
        else if(res){
          let imageData = {};
          let docData = [image];
          __.forEach(docData, (content, key)=>{
              if(content.fileName){
                  imageData[key] = content;
                  imageData[key].file = content.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
                  content = '';
              }
          });
          __.forEach(imageData, (img, key)=>{
              buf = new Buffer(img.file, 'base64');
              Files.write(buf, {fileName: img.fileName, userId: userId, type: img.type}, (err, fileRef)=>{
                  if (err) {
                    throw err;
                  } else {
                    Classifies.update({ _id: res },{$set: {image: fileRef._id}});
                  }
              }, true);
          });
        }
      }));
    }
    else {
      future.return();
    }
    return future.wait();
  },
  updateClassify: (_, {userId, _id , info, image}) => {
    let user = Meteor.users.find({_id: userId});
    let future = new Future();
    if(user) {
      if(typeof info == 'string'){
        info = JSON.parse(info)
      }
      if(typeof image == 'string'){
        image = JSON.parse(image);
      }
      let imagesExit = [], docData = [], imageData = {};
      if(info.image && info.image._id){
        future.return(
          Classifies.update({_id: _id},{$set: info})
        )
      }
      else {
        future.return(
          Classifies.update({_id: _id}, {$set: info}, (err) => {
            if(err){
              console.log(err);
            }
            else {
              if(info.image && info.image.fileName){
                docData = [info.image]
                __.forEach(docData, (content, key)=>{
                    if(content.fileName){
                        imageData[key] = content;
                        imageData[key].file = content.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
                        content = '';
                    }
                });
                __.forEach(imageData, (img, key)=>{
                    buf = new Buffer(img.file, 'base64');
                    Files.write(buf, {fileName: img.fileName, userId: user._id, type: img.type}, (err, fileRef)=>{
                        if (err) {
                          throw err;
                        } else {
                          Classifies.update({ _id: _id },{$set: { image: fileRef._id }});
                        }
                    }, true);
                });
              }
            }
          })
        )
      }
    }
    else {
      future.return()
    }
    return future.wait();
  },
  insertTour: (_,{userId,info}) => {
    let user = Meteor.users.findOne({_id: userId});
    let future = new Future();
    if (user){
      info = JSON.parse(info);
      let imageData = {};
      info.data.images = []
      info.data.createdAt = moment().valueOf();
      info.data.createdBy = {
         _id: user._id,
         username: user.username
      };
      future.return(Tours.insert(info.data, (err,res) => {
        if (err) {console.log(err);}
        else if(res){
          let docData = info.images;
          let indexValue = 0;
          new Promise(function(resolve, reject) {
            __.forEach(docData, (content, key)=>{
              indexValue +=1;
                if(content.fileName){
                    imageData[key] = content;
                    imageData[key].file = content.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
                    content = '';
                }
                if(indexValue >= docData.length){
                  resolve();
                }
            });
          }).then(() => {
            __.forEach(imageData, (img, key)=>{
                buf = new Buffer(img.file, 'base64');
                Files.write(buf, {fileName: img.fileName, userId: userId, type: img.type}, (err, fileRef)=>{
                    if (err) {
                      throw err;
                    } else {
                      console.log(res);
                      Tours.update({ _id: res },{ $push: { images: fileRef._id }});
                    }
                }, true);
            });
          })
        }
      }))
    }
    return future.wait();
},
updateTour: (_, {userId,_id, info}) => {
  if(typeof info == 'string'){
    info = JSON.parse(info);
  }
  let future = new Future();
  let user = Meteor.users.findOne({_id: userId});
  if (user){
    let imagesExit = [], docData = [], imageData = {};
    info.data.updatedAt = moment().valueOf();
    info.data.updatedBy = {
       _id: user._id,
       username: user.username
    };
    __.forEach(info.images,(image) => {
      if(image._id)
        imagesExit.push(image._id);
        else {
          docData.push(image);
        }
    })
    info.data.images = imagesExit;
    future.return(
      Tours.update({_id: _id}, {$set: info.data}, (err) => {
        if(err){
          console.log(err);
        }
        else {
          if(info.images){
            __.forEach(docData, (content, key)=>{
                if(content.fileName){
                    imageData[key] = content;
                    imageData[key].file = content.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
                    content = '';
                }
            });
            __.forEach(imageData, (img, key)=>{
                buf = new Buffer(img.file, 'base64');
                Files.write(buf, {fileName: img.fileName, userId: user._id, type: img.type}, (err, fileRef)=>{
                    if (err) {
                      throw err;
                    } else {
                      Tours.update({ _id: _id },{ $push: { images: fileRef._id }});
                    }
                }, true);
            });
          }
        }
      })
    )
  }
  return future.wait();
},
  insertTeamBuildings: (_, { info }) => {
    info = JSON.parse(info);
    info.createdAt = moment().valueOf();
    info.status = 0;
    return TeamBuildings.insert(info);
  },
  removeTeamBuilding: (_, { userId, _id }) => {
    let user = Meteor.users.findOne({_id: userId});
    if(user) {
      TeamBuildings.remove({_id});
    }
    return;
  },
  verifyTeamBuilding: (_, { userId, _id }) => {
    let user = Meteor.users.findOne({_id: userId});
    if(user) {
      TeamBuildings.update({_id}, {$set: {
        status: 100,
        verifyAt: moment().valueOf(),
        verifyBy: {
          _id: user._id,
          username: user.username
        }
      }});
    }
    return
  },
  insertAccountingObject: (_, { info, type }) => {
    info = JSON.parse(info);
    info.createdAt = moment().valueOf();
    info.status = 0;
    info[type] = true
    return AccountingObjects.insert(info);
  },
  removeAccountingObject: (_, { userId, _id }) => {
    let user = Meteor.users.findOne({_id: userId});
    if(user) {
      AccountingObjects.remove({_id});
    }
    return;
  },
  updateAccountingObject: (_, { userId, _id, info }) => {
    let user = Meteor.users.findOne({_id: userId});
    if(user) {
      info = JSON.parse(info);
      AccountingObjects.update({_id}, {$set: info});
    }
    return;
  },
  verifyAccountingObject: (_, { userId, _id }) => {
    let user = Meteor.users.findOne({_id: userId});
    if(user) {
      AccountingObjects.update({_id}, {$set: {
        status: 100,
        verifyAt: moment().valueOf(),
        verifyBy: {
          _id: user._id,
          username: user.username
        }
      }});
    }
    return
  },
  insertFiles: (_, { info }) => {
    info = JSON.parse(info);
    let file = info;
    let future = new Future();
    if(file.fileName) {
      file.fileName = Random.id(5) + file.fileName;
      file.file = file.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
    }
    buf = new Buffer(file.file, 'base64');
    Files.write(buf, {fileName: file.fileName, type: file.type}, (err, fileRef)=>{
        if (err) {
          throw err;
        } else {
            let file = Files.findOne({_id: fileRef._id});
            Files.update({_id: file._id}, {$set: {
              link: file.link()
            }});
            future.return(file.link());
        }
    }, true);
    return future.wait();
  },
  insertPost: (_,{userId, info}) => {
    let user = Meteor.users.findOne({_id: userId});
    let future = new Future();
    if (user){
      info = JSON.parse(info);
      let imageData = {};
      info.data.image = ''
      info.data.createdAt = moment().valueOf();
      info.data.createdBy = {
         _id: user._id,
         username: user.username
      };
      future.return(Posts.insert(info.data, (err,res) => {
        if (err) {console.log(err);}
        else if(res){
          let docData = [info.image];
          __.forEach(docData, (content, key)=>{
              if(content.fileName){
                  imageData[key] = content;
                  imageData[key].file = content.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
                  content = '';
              }
          });
          __.forEach(imageData, (img, key)=>{
              buf = new Buffer(img.file, 'base64');
              Files.write(buf, {fileName: img.fileName, userId: userId, type: img.type}, (err, fileRef)=>{
                  if (err) {
                    throw err;
                  } else {
                    Posts.update({ _id: res },{$set: {image: fileRef._id}});
                  }
              }, true);
          });
        }
      }))
    }
    return future.wait();
  },
  updatePost: (_, {userId, _id, info}) => {
    if(typeof info == 'string'){
      info = JSON.parse(info);
    }
    let future = new Future();
    let user = Meteor.users.findOne({_id: userId});
    if (user){
      let imagesExit = [], docData = [], imageData = {};
      info.data.updatedAt = moment().valueOf();
      info.data.updatedBy = {
         _id: user._id,
         username: user.username
      };
      if(info.image && info.image._id){
        future.return(
          Posts.update({_id: _id}, {$set: info.data}, (err) => {
            if(err){
              throw err;
            }
          })
        )
      }
      else {
        future.return(
          Posts.update({_id: _id}, {$set: info.data}, (err) => {
            if(err){
              console.log(err);
            }
            else {
              if(info.image && info.image.fileName){
                docData = [info.image]
                __.forEach(docData, (content, key)=>{
                    if(content.fileName){
                        imageData[key] = content;
                        imageData[key].file = content.file.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
                        content = '';
                    }
                });
                __.forEach(imageData, (img, key)=>{
                    buf = new Buffer(img.file, 'base64');
                    Files.write(buf, {fileName: img.fileName, userId: user._id, type: img.type}, (err, fileRef)=>{
                        if (err) {
                          throw err;
                        } else {
                          Posts.update({ _id: _id },{$set: { image: fileRef._id }});
                        }
                    }, true);
                });
              }
            }
          })
        )
      }
    }
    return future.wait();
  },
  saveCustomer: (_, {userId, info}) => {
    let user = Meteor.users.findOne({_id: userId});
    if(user) {
      info = JSON.parse(info);
      info.verifyAt = moment().valueOf();
      info.createdAt = moment().valueOf();
      info.isRegister = true;
      info.verifyBy = {
        _id: user._id,
        username: user.username
      }
      return AccountingObjects.insert(info);
    }
    return;
  },
  removeFile: (_, {userId, _id}) => {
    let user = Meteor.users.findOne({_id: userId});
    if(user) {
      return Files.remove({_id})
    }
    return;
  },
  insertNotification: (_, {info}) => {
    info = JSON.parse(info);
    return Notifications.insert(info);
  }
}
export default rootMutation
