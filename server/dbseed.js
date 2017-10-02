import moment from 'moment';

Meteor.startup(function () {
  process.env.MAIL_URL="smtp://noreply.lokatech@gmail.com:defa4ltlokatech@smtp.gmail.com:587/";
  process.env.MAIL_URL="smtp://evitour.info@gmail.com:Evitour@123@smtp.gmail.com:587/";
  let setting = Settings.findOne({_id: 'buildmodify'});
  if(!setting) {
    Settings.insert({
      _id: 'buildmodify',
      accessCount: 0,
      insurance: '',
      terms: ''
    });
  }
  else {
    if(!setting.insurance){
      Settings.update({_id: setting._id}, {$set: {insurance: ''}});
    }
    if(!setting.terms){
      Settings.update({_id: setting._id}, {$set: {terms: ''}});
    }
  }
  if(Regions.find({}).count() === 0) {
    Regions.insert({
      code: 'MB',
      name: 'Miền Bắc',
      active: true,
      createdAt: moment().valueOf(),
      accessToken: [],
      createdBy: {
        _id: '0',
        username: 'admin'
      }
    });
    Regions.insert({
      code: 'MT',
      name: 'Miền Trung',
      active: true,
      createdAt: moment().valueOf(),
      accessToken: [],
      createdBy: {
        _id: '0',
        username: 'admin'
      }
    });
    Regions.insert({
      code: 'MN',
      name: 'Miền Nam',
      active: true,
      createdAt: moment().valueOf(),
      accessToken: [],
      createdBy: {
        _id: '0',
        username: 'admin'
      }
    });
  }
})
