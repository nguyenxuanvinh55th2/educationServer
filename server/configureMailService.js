const AddNotification = (userId) => {
  var query = Meteor.users.findOne({_id: userId});
  var userName = query.profile ? (query.profile.name ? query.profile.name : query.profile.fullName) : query.services.google.name;
  console.log(userName + ' đã nhận mail của bạn');
}

if (Meteor.isServer) {
  // Global API configuration
  var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });


  // Generates: GET, POST on /api/items and GET, PUT, DELETE on
  // /api/items/:id for the Items collection
  // Api.addCollection(Items);
  //
  // // Generates: POST on /api/users and GET, DELETE /api/users/:id for
  // // Meteor.users collection
  // Api.addCollection(Meteor.users, {
  //   excludedEndpoints: ['getAll', 'put'],
  //   routeOptions: {
  //     authRequired: true
  //   },
  //   endpoints: {
  //     post: {
  //       authRequired: false
  //     },
  //     delete: {
  //       roleRequired: 'admin'
  //     }
  //   }
  // });

  // Maps to: /api/articles/:id
  Api.addRoute('imgs/hello12.jpg', {authRequired: false}, {
    get: function () {
      //return Articles.findOne(this.urlParams.id);
      // console.log('userId ', this.request.query);
      let userId = Object.keys(this.request.query)[0];
      AddNotification(userId);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/jpg',
          'Cache-Control': 'no-cache, max-age=0'
        }
      }
    },
    delete: {
      roleRequired: ['author', 'admin'],
      action: function () {
        // if (Articles.remove(this.urlParams.id)) {
        //   return {status: 'success', data: {message: 'Article removed'}};
        // }
        // return {
        //   statusCode: 404,
        //   body: {status: 'fail', message: 'Article not found'}
        // };
      }
    }
  });
}
