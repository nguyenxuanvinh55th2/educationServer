const rootQuery = {
  region: () => {
    return Regions.find({active: true}).fetch();
  },
  advertisements: (_, {type}) => {
    if(type !== 'image' && type !== 'advertise') {
      return Advertisements.find({type, isShow: true}, {sort: {createdAt: -1}}).fetch();
    } else {
        let advertise =  Advertisements.find({}, {sort: {createdAt: -1}}).fetch();
        if(type === 'image') {
          return __.filter(advertise, item => (item.type !== 'popup' && item.type !== 'header'))
        } else {
            return __.filter(advertise, item => (item.type === 'popup' || item.type === 'header'))
        }
    }
  },
  sliders: (_, {type}) => {
    if(type) {
      return Sliders.find({type, isShow: true}, {sort: {createdAt: -1}}).fetch();
    } else {
        return Sliders.find({}, {sort: {createdAt: -1}}).fetch();
    }
  },
  teamBuildings: (_, {}) => {
    return TeamBuildings.find({}, {sort: {createdAt: -1}}).fetch();
  },
  AccountingObjects: (_, {type}) => {
    if(type) {
      let codition = {};
      codition[type] = true;
      return AccountingObjects.find(codition, {sort: {createdAt: -1}}).fetch();
    } else {
        return AccountingObjects.find({}, {sort: {createdAt: -1}}).fetch();
    }
  },
  classifies: (_, {query, limit}) => {
    if(typeof query == 'string'){
      query = JSON.parse(query);
    }
    if(limit){
      return Classifies.find(query).fetch().slice(0, limit);
    }
    else {
      return Classifies.find(query).fetch();
    }
  },
  regionsClassSifies: (_) => {
    return Classifies.find({active: true, isRegion: true}).fetch();
  },
  tours: (_, {query,limit}) => {
    if(typeof query == 'string'){
      query = JSON.parse(query);
    }
    if(limit) {
      return Tours.find(query, {sort: {createdAt: -1}}).fetch().slice(0, limit);
    } else {
        return Tours.find(query, {sort: {createdAt: -1}}).fetch();
    }
  },
  tour: (_, {_id}) => {
    return Tours.findOne({_id: _id});
  },
  detailTour: (_, {slug}) => {
    return Tours.findOne({slug: slug});
  },
  bookTours: (_, {limit}) => {
    if(limit){
      return Tours.find({active: true, isBooktour: true, isChildrent: true}, {sort: {createdAt: -1}}).fetch().slice(0, limit);
    }
    else {
      return Tours.find({active: true, isBooktour: true, isChildrent: true}, {sort: {createdAt: -1}}).fetch();
    }
  },
  hotTours: (_, {limit}) => {
    if(limit){
      return Tours.find({active: true, isSohot: true, isChildrent: true}, {sort: {createdAt: -1}}).fetch().slice(0, limit);
    }
    else {
      return Tours.find({active: true, isSohot: true, isChildrent: true}, {sort: {createdAt: -1}}).fetch();
    }
  },
  images: (_, {}) => {
    let datas = [];
    let images = Files.find({isImage: true}).fetch();
    __.forEach(images, (file) => {
      if(file.link) {
        datas.push({
          _id: file._id, fileName: file.name, type: file.type,
          file: file.link
        });
      }
    });
    return datas;
  },
  findProduct: (_, {query, offset, limit}) => {
    if(typeof query == 'string') {
      query = JSON.parse(query);
    }
    if(query.isType){
      let queryData = {};
      let data = [], child = [];
       child = Tours.find({
        active: true, isChildrent: true,
        'type.slug': query.slug
      }).map((tour) => tour.tour._id)
      if(offset){
        return Tours.find({_id: {$in: child}, active: true, isParent: true}, {sort: {createdAt: -1}, skip: offset, limit: limit}).fetch();
      }
      else {
        return Tours.find({_id: {$in: child}, active: true, isParent: true}, {sort: {createdAt: -1}}).fetch().slice(0, limit);
      }
    }
    else if (query.isFinding) {
      let orArrP = [], orArrC = [];
      if(typeof query == 'string'){
        query = JSON.parse(query);
      }
      let info = query.info;
      if(info['ten-tour'] || info['loai-hinh-tour'] || info['dia-diem-du-lich'] || info['vung-mien']){
        if(info['ten-tour']){
          //parent
          orArrP.push({code: {$regex: info['ten-tour'], $options: 'iu'}});
          orArrP.push({name: {$regex: info['ten-tour'], $options: 'iu'}});
          //child
          orArrC.push({code: {$regex: info['ten-tour'], $options: 'iu'}});
          orArrC.push({name: {$regex: info['ten-tour'], $options: 'iu'}});
        }
        if(info['loai-hinh-tour']){
          //parent
          orArrC.push({'type.code': {$regex: info['loai-hinh-tour'], $options: 'iu'}});
          orArrC.push({'type.name': {$regex: info['loai-hinh-tour'], $options: 'iu'}});
        }
        if(info['dia-diem-du-lich']){
          orArrP.push({'holidayDestinations':{$elemMatch:{code: info['dia-diem-du-lich']}}});
          orArrP.push({'holidayDestinations':{$elemMatch:{name: info['dia-diem-du-lich']}}});
        }
        if(info['vung-mien']){
          orArrP.push({'regions':{$elemMatch:{code: info['vung-mien']}}});
          orArrP.push({'regions':{$elemMatch:{name: info['vung-mien']}}});
        }
        let tourChilds = [];
        if(orArrC.length){
          tourChilds = Tours.find({$and: [{$or: orArrC}, {active: true}, {isChildrent: true}]}, {sort: {createdAt: -1}}).map((tour) => tour.tour._id);
        }
        if(offset){
          return Tours.find({$or: [{$and: [{$or: orArrP}, {active: true}, {isParent: true}]}, {_id: {$in: tourChilds}}]}, {sort: {createdAt: -1}, skip: offset, limit: limit}).fetch();
        }
        else {
          return Tours.find({$or: [{$and: [{$or: orArrP}, {active: true}, {isParent: true}]}, {_id: {$in: tourChilds}}]}, {sort: {createdAt: -1}}).fetch().slice(0, limit);
        }
      }
      else {
        if(offset){
          return Tours.find(query, {sort: {createdAt: -1}, skip: offset, limit: limit}).fetch();
        }
        else {
          return Tours.find(query, {sort: {createdAt: -1}}).fetch().slice(0, limit);
        }
      }
    }
    else {
      if(offset){
        return Tours.find(query, {sort: {createdAt: -1}, skip: offset, limit: limit}).fetch();
      }
      else {
        return Tours.find(query, {sort: {createdAt: -1}}).fetch().slice(0, limit);
      }
    }
  },
  users: (_, {}) => {
    return Meteor.users.find({_id: {$ne: "0"}}).fetch();
  },
  posts: (_,{limit, query}) => {
    if(typeof query == 'string'){
      query = JSON.parse(query);
    }
    if(limit){
      return Posts.find(query, {sort: {createdAt: -1}}).fetch().slice(0, limit);
    }
    else {
      return Posts.find(query, {sort: {createdAt: -1}}).fetch();
    }
  },
  post: (_, {_id}) => {
    return Posts.findOne({_id: _id})
  },
  postDetail: (_, {slug}) => {
    return Posts.findOne({slug: slug})
  },
  findPost: (_, {query, offset, limit}) => {
    if(typeof query == 'string') {
      query = JSON.parse(query);
    }
    return Posts.find(query, {sort: {createdAt: -1}, skip: offset, limit: limit}).fetch();
  },
  setting: () => {
    return Settings.findOne({_id: 'buildmodify'});
  },
  files: (_, {type}) => {
    let codition = {};
    codition[type] = true;
    return Files.find(codition).map((img)=>{
        return {
          _id: img._id,
          file: img.link,
          fileName: img.name,
          type: img.type,
          typeUse: img.typeUse
        };
    });
  },
  getAllStockModelSearch: (_, { keyCode }) => {
    if (keyCode) {
      let condition = {
        $or: [
          {code: {$regex: keyCode, $options: 'iu'}},
          {name: {$regex: keyCode, $options: 'iu'}},
        ]
      }
      return Tours.find({$and: [condition, {active: true}, {isParent: true}]}, {sort: {createdAt: -1}}).fetch();
    } else {
      return [];
    }
  },
  notifications: (_, {userId}) => {
    return Notifications.find({toId: userId}, {sort: {createdAt: -1}}).fetch();
  }
}
export default rootQuery;
