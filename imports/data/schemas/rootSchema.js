const rootSchema = `
    schema {
      query: Query
      mutation: Mutation
    }
    type Region {
      _id: String
      code: String
      name: String
    }
    type File {
      _id: String,
      file: String,
      fileName: String,
      type: String,
      typeUse: String
      item: String
    }
    type Classify {
      _id: String
      code: String
      name: String
      slug: String
      description: String
      isTour: Boolean
      isLocation: Boolean
      isDomestic: Boolean
      isRegion: Boolean
      isPopup: Boolean
      isTrip: Boolean
      isFinding: Boolean
      image: File
      stockType: Classify
      childrents: [Classify]
    }
    type Tour {
      _id: String
      code: String
      name: String
      title: String
      slug: String
      ceoContent: String
      isDomestic: Boolean
      type: Classify
      regions: [Classify]
      trips: [Classify]
      holidayDestinations: [Classify]
      countAccess: Int
      dateStart: Float
      isSohot: Boolean
      isPromotion: Boolean
      isBooktour: Boolean
      isChildrent: Boolean
      isParent: Boolean
      price: Float
      saleOff: Float
      detail: DetailTour
      images: [File]
      startDate: Float
      endDate: Float
      tour: Tour
    }
    type DetailTour {
      _id: String
      program: String,
      priceTag: String,
      hotel: String,
      menu: String,
      terms: String
    }
    type Advertisement {
      _id: String
      name: String
      title: String
      description: String
      image: File
      type: String
      createdAt: String
      createdBy: User
      isShow: Boolean
      link: String
      time: Int
    }
    type Notification {
      _id: String
      note: String
      toId: String
      isRead: Boolean
      link: String
      createdAt: Float
    }
    type TeamBuilding {
      _id: String
      name: String
      place: String
      status: Int
      peopleCount: Int
      dateStart: String
      dateEnd: String
      address: String
      hotelStar: Int
      mobile: String
      email: String
      createdAt: Float
      verifyAt: Float
      verifyBy: User
    }
    type AccountingObject {
      _id: String
      name: String
      isFeedBack: Boolean
      isRegister: Boolean
      status: Int
      mobile: String
      email: String
      createdAt: Float
      verifyAt: Float
      verifyBy: User
      address: String
      feedBack: String
    }
    type Email {
      address: String
      verified: Boolean
    }
    type User {
      _id: String
      emails: [Email]
      username: String
      fullName: String
      firstName: String
      lastName: String
      email: String
      token: String
      image: String
      dateOfBirth: Float
      gender: Boolean
      receivedNote: Boolean
    }
    type Post {
      _id: String
      title: String
      slug: String
      ceoContent: String
      content: String
      image: File
      createdAt: Float
      active: Boolean
      isPromotion: Boolean
      isEvent: Boolean
      startDate: Float
      endDate: Float
    }
    type Setting {
      _id: String
      accessCount: Int
      insurance: String
      terms: String
    }
    type Query {
      region: [Region]
      advertisements(type: String): [Advertisement]
      sliders(type: String): [Advertisement]
      classifies(query: String, limit: Int): [Classify]
      regionsClassSifies: [Classify]
      tours(query: String,limit: Int): [Tour]
      teamBuildings: [TeamBuilding]
      AccountingObjects(type: String): [AccountingObject]
      tour(_id: String): Tour
      detailTour(slug: String): Tour
      bookTours(limit: Int): [Tour]
      hotTours(limit: Int): [Tour]
      images: [File]
      users: [User]
      findProduct(query: String, offset: Int, limit: Int): [Tour]
      posts(limit: Int, query: String): [Post]
      post(_id: String): Post
      postDetail(slug: String): Post
      findPost(query: String, offset: Int, limit: Int): [Post]
      setting: Setting
      files(type: String): [File]
      getAllStockModelSearch(keyCode: String): [Tour]
      notifications(userId: String): [Notification]
    }
    type Mutation {
      insertTask(_id: String): String
      changePassword(userId: String, password: String, oldPassword: String): String
      updateRegionView(_id: String, token: String): String
      insertOrUpdateAdvertise(userId: String, _id: String, info: String): String
      insertOrUpdateImage(userId: String, _id: String, info: String): String
      removeAdvertise(userId: String, _id: String): String
      insertOrUpdateSlider(userId: String, _id: String, info: String): String
      removeSlider(userId: String, _id: String): String
      selectAdvertise(userId: String, _id: String): String
      insertClassify(userId: String!, info: String, image: String): String
      updateClassify(userId: String!, _id: String!, info: String, image: String): String
      insertTour(userId: String!, info: String): String
      updateTour(userId: String ,_id: String, info: String): String
      insertTeamBuildings(info: String): String
      removeTeamBuilding(userId: String, _id: String): String
      verifyTeamBuilding(userId: String, _id: String): String
      insertAccountingObject(info: String, type: String): String
      removeAccountingObject(userId: String, _id: String): String
      updateAccountingObject(userId: String, _id: String, info: String): String
      verifyAccountingObject(userId: String, _id: String): String
      insertFiles(info: String): String
      saveUser(token: String!, info: String): String
      removeUser(token: String!, id: String): String
      insertPost(userId: String, info: String): String
      updatePost(userId: String, _id: String, info: String): String
      saveCustomer(userId: String, info: String): String
      removeFile(userId: String, _id: String): String
      insertNotification(info: String): String
    }
`
export default rootSchema;
