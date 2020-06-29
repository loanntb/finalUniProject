
const { imageModel, HomeBarModel, BarModel } = require('../models/barModel');
/**
 * GET /contact
 * Contact form page.
 */
exports.getHome = (req, res) => {

  //for home 
  BarModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
    if (!data) {
      data = new BarModel({ "_id" : { "$oid" : "5c9b4984e2b168391c5423b9" }, "__type" : "Bar", "info" : { "address" : "123 Lê Văn lương, Hà Nội", "phone" : "123456", "description" : "Cà phê Trung Nguyên, nguyên chất \r\nBao gồm máy pha cà phê hiện tại nhất thành phố,..." }, "slides" : [ { "image" : "/images/hinh-anh-cafe-dep-ly-cafe-ca-phe-sua-da-ca-phe-den-9.jpg" }, { "image" : "/images/images.jpg" }, { "image" : "/uploads/image-1554189387891.jpg" }, { "image" : "/uploads/image-1554189387891.jpg" } ], "__v" : 78 });
    }
    
    res.render('bar', {
      title: 'bar',
      data
    });

  });

};
exports.getAdmin = (req, res) => {
  BarModel.findOne({ __type: 'cafe' }, (err, data) => {
    if (err) { return next(err); }
    if (!data) {
      data = new BarModel( );
    }
    if(!data.info){
      data.info= new HomeBarModel();
    }
    console.log(data);
    res.render('pages/bar', {
      title: 'Bar',
      data,
    });
  });

};


exports.postHomeCafe = (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
  const cafeModel = new HomeBarModel({
    address: req.body.address,
    phone: req.body.phone,
    description: req.body.description,
  });

  const homeBModel = new BarModel({
    info: cafeModel
  }
  );
  BarModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.info = cafeModel;
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/bar');
      });
    } else {
      homeBModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/bar');
      });
    }
  });
};
exports.postSilde = (req, res) => {
  console.log(req);
  const homeBModel = new BarModel({
    slides: []
  });
  for (var i = 0; i < req.files.length; i++) {
    const imgModel = new imageModel({
      image: '/uploads/' + req.files[i].filename
    });
    homeBModel.slides.push(imgModel);
  }



  BarModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.slides = [...data.slides, ...homeBModel.slides];
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/bar');
      });
    } else {
      homeBModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/bar');
      });
    }

  });
};
exports.deleteSlides = (req, res, next) => {
  BarModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.slides.splice(req.body.id, 1);
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/bar');
      });
    }
  });

};
