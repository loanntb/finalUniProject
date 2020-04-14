
const { imageModel, HomeCafeModel, CafeModel } = require('../models/cafeModel');
/**
 * GET /contact
 * Contact form page.
 */
exports.getHome = (req, res) => {

  //for home 
  CafeModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
    if (!data) {
      data = new CafeModel({ "_id" : { "$oid" : "5c9b4984e2b168391c5423b9" }, "__type" : "Cafe", "info" : { "address" : "123 Lê Văn lương, Hà Nội", "phone" : "123456", "description" : "Cà phê Trung Nguyên, nguyên chất \r\nBao gồm máy pha cà phê hiện tại nhất thành phố,..." }, "slides" : [ { "image" : "/images/hinh-anh-cafe-dep-ly-cafe-ca-phe-sua-da-ca-phe-den-9.jpg" }, { "image" : "/images/images.jpg" }, { "image" : "/uploads/image-1554189387891.jpg" }, { "image" : "/uploads/image-1554189387891.jpg" } ], "__v" : 78 });
    }
    // if(!data.info){
    //   data.info= new HomeCafeModel();
    // }
    res.render('cafe', {
      title: 'Cafe',
      data
    });

  });

};
exports.getAdmin = (req, res) => {


  CafeModel.findOne({ __type: 'cafe' }, (err, data) => {
    if (err) { return next(err); }
    if (!data) {
      data = new CafeModel( );
    }
    if(!data.info){
      data.info= new HomeCafeModel();
    }
    console.log(data);
    res.render('pages/cafe', {
      title: 'Cafe',
      data,
    });
  });

};


exports.postHomeCafe = (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
  const cafeModel = new HomeCafeModel({
    address: req.body.address,
    phone: req.body.phone,
    description: req.body.description,
  });

  const homeCafetModel = new CafeModel({
    info: cafeModel
  }
  );
  CafeModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.info = cafeModel;
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/cafe');
      });
    } else {
      homeCafetModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/cafe');
      });
    }
  });
};
exports.postSilde = (req, res) => {
  console.log(req);
  const homeCafetModel = new CafeModel({
    slides: []
  });
  for (var i = 0; i < req.files.length; i++) {
    const imgModel = new imageModel({
      image: '/uploads/' + req.files[i].filename
    });
    homeCafetModel.slides.push(imgModel);
  }



  CafeModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.slides = [...data.slides, ...homeCafetModel.slides];
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/cafe');
      });
    } else {
      homeCafetModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/cafe');
      });
    }

  });
};
exports.deleteSlides = (req, res, next) => {
  CafeModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.slides.splice(req.body.id, 1);
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/cafe');
      });
    }
  });

};
