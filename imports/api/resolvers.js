const resolveFunctions = {
  Query: {
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

  Subscription: {
    getsub: (root) => {

    }
  },

};

export default resolveFunctions;
