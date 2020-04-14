const {SlideModel,  PageModel,  InfoModel,} = require('../models/tuyendungModel');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  //home
  PageModel.findOne({  }, (err, data) => {
      if (err) { return next(err); }
      if (!data) {
        data = new PageModel();
     }
     if (!data.info) {
       data.info = new InfoModel();
     }
      
      res.render('tuyendung', {
        title: 'Trang tuyển dụng',
        data,
      });
    });
  
};


exports.getHome = (req, res, next) => {
//admin
  PageModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
     if (!data) {
       data = new PageModel();
    }
    if (!data.info) {
      data.info = new InfoModel();
    }
    res.render('pages/tuyendung', {
      title: 'Trang tuyển dụng',
      data,

    });
  });

};

exports.postHomeSlide = (req, res, next) => {
  req.assert('sub_title', 'Sub title cannot be blank').notEmpty();
  req.assert('title', 'Title cannot be blank').notEmpty();
  const errors = req.validationErrors();
  console.log(req.body);
  if (errors) {
    req.flash('errors', errors);
    res.redirect('/pages/tuyendung');
  }
  
  var img="";
  if(req.body.img && !req.file){
    img=req.body.img;
  }else{
    img='/uploads/'+req.file.filename;
  }
  const slideModel = new SlideModel({
    title: req.body.title,
    sub_title: req.body.sub_title,
    image_url: img,
  });

  const homeModel = new PageModel({
    slides: [slideModel]
  });

  PageModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      if(req.body.img){
        data.slides[req.body.id]= slideModel;
      }else{
        data.slides = [...data.slides, ...homeModel.slides];
      }
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/tuyendung');
      });
    } else {
      homeModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/tuyendung');
      });
    }
  });
};
exports.deleteHomeSlide = (req, res, next) => {
  PageModel.findOne({ }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.slides.splice(req.body.id, 1);
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/tuyendung');
      });
    }
  });

};
exports.postHomeWelcome = (req, res, next) => {
  const welcomeModel = new InfoModel({
    description: req.body.description,
    update_at: new Date()
  });

  const homeModel = new PageModel({
    info: welcomeModel
  });

  PageModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.info = welcomeModel;
      
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/tuyendung');
      });
    } else {
      homeModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/tuyendung');
      });
    }
  });
};








