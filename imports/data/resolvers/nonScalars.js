const NonScalars = {
  Advertisement: {
    image: ({imageId}) => {
      let file = Files.findOne({_id: imageId});
      return {_id: imageId, file: file.link()}
    },
    link: ({link}) => {
      if(typeof link === 'string') {
        return link;
      } else {
          return JSON.stringify(link);
      }
    }
  },
  User: {
    emails: ({emails}) => emails,
    fullName: ({profile}) => profile.fullName,
    firstName: ({profile}) => profile.firstName,
    lastName: ({profile}) => profile.lastName,
    email: ({emails}) => emails
      ? emails[0].address
      : '',
    gender: ({profile}) => profile.gender,
    dateOfBirth: ({profile}) => profile.dateOfBirth,
    receivedNote: ({profile}) => profile.receivedNote,
    image: ({profile}) => profile.image
      ? Files.findOne({_id: profile.image}).link()
      : ''
  },
  Tour: {
    images: ({images}) => {
      if (images && images[0]) {
        let datas = [];
        __.forEach(images, (img) => {
          let file = Files.findOne({_id: img});
          if (file) {
            datas.push({_id: file._id, fileName: file.name, type: file.type, file: file.link()});
          }
        });
        return datas;
      }
      return []
    }
  },
  Post: {
    image: ({image}) => {
      if(image){
        let file = Files.findOne({_id: image});
        if(file){
          return {
            _id: file._id, fileName: file.fileName, type: file.type,
            file: file.link()
          }
        }
      }
      return {}
    }
  },
  File: {
    item: (image) => {
      if(image.typeUse === 'tour') {
        return Tours.find({imageId: image._id}).map(item => item.name).toString();
      }
      if(image.typeUse === 'tourType') {
        return Classifies.find({imageId: image._id}).map(item => item.name).toString();
      }
    }
  },
  Classify: {
    image: ({image}) => {
      if(image){
        let file = Files.findOne({_id: image});
        if(file){
          return {
            _id: file._id, fileName: file.fileName, type: file.type,
            file: file.link()
          }
        }
      }
      else {
        return {}
      }
    },
    childrents: (root) => {
      if(root.isRegion){
        return Classifies.find({$and: [{active: true}, {isLocation:  true}, {'stockType._id': root._id }]}).fetch()
      }
      else {
        return []
      }
    }
  }
}
export default NonScalars;
