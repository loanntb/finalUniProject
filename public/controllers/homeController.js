const { HomePageModel, HomeWelcomeModel, HomeIntroModel } = require('../models/pageModel');
const room = require('../models/roomModel');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  room.find((err, dataroom) => {
    if (err) { return next(err); }
    HomePageModel.findOne({ __type: 'HomePage' }, (err, data) => {
      if (err) { return next(err); }
      if (!data) {
        data = new HomePageModel({ "_id" : { "$oid" : "5c8b18211086fa28585dc4f4" }, "__type" : "HomePage", "slides" : [ { "title" : "Chào mừng quý khách", "sub_title" : "Welcome", "link_url" : "sdfsdf", "image_url" : "/images/slide1-01.jpg" }, { "title" : "Ẩm thực đạm chất Bắc bộ", "sub_title" : "Ẩm thực", "link_url" : "ádasd", "image_url" : "/images/bg-intro-01.jpg" } ], "__v" : 127, "welcome" : { "description" : "Apartments simplicity or understood do it we. Song such eyes had and off. Removed winding ask explain delight out few behaved lasting. Letters old hastily ham sending not sex chamber because present. Oh is indeed twenty entire figure. Occasional diminution announcing new now literature terminated. Really regard excuse off ten pulled. Lady am room head so lady four or eyes an. He do of consulted sometimes concluded mr. An household behaviour if pretended. ", "welcome_url" : "dfgdfgdfg", "image_url" : "/uploads/welcome-1553140788018.jpg" }, "intro" : [ { "service" : "Khách sạn", "description" : "Có vị trí đẹp với các dịch vụ tiện tích hấp dẫn", "url" : "xxx", "image" : "/uploads/intro-1553140870570.jpg" }, { "service" : "Nhà hàng", "description" : "Ẩm thực Việt đậm chất Bắc Bộ ", "url" : "sss", "image" : "/uploads/intro-1553140935472.jpg" }, { "service" : "Quán cà phê", "description" : "Cà phê Trung Nguyên, Cà phê chồn", "url" : "menu", "image" : "/uploads/intro-1553140984805.jpg" } ] }    
      );
      }
      if (!data.welcome) {
        data.welcome = new HomeWelcomeModel();
      }
      if(!dataroom) {
        dataroom = new HomeRoomModel({ "_id" : ObjectId("5ed442a6ed0e352074868dee"), "occupancy" : "2", "status" : "empty", "name" : "B1_101", "floor" : "Tầng 1 nhà B", "type" : "standard", "convenient" : "máy sấy, tủ quần áo, wifi", "description" : "Phòng khá nhỏ", "area" : "25", "amount_bed" : "1", "price" : 250, "image" : "/uploads/room-1590968998511.jpg", "__v" : 0 });
      }
      console.log(dataroom);
      res.render('home', {
        title: 'Home',
        data,
        dataroom
      });
    });
  });
};


exports.getHome = (req, res, next) => {

  HomePageModel.findOne({ __type: 'HomePage' }, (err, data) => {
    if (err) { return next(err); }
    // console.log(data);
    if (!data) {
      data = new HomePageModel();
     
    }
    if (!data.welcome) {
      data.welcome = new HomeWelcomeModel();
    }
    res.render('pages/home', {
      title: 'Cập nhật trang chủ',
      data,
    });
  });

};

exports.getService = (req, res, next) => {
    res.render('service', {
      title: 'Dịch vụ',
    });
}; 



exports.postHomeWelcome = (req, res, next) => {
  req.assert('description', 'Mô tả không được để trống').notEmpty();
  req.assert('welcome_url', 'Url không được để trống').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    res.redirect('/pages/home');
  }
  var img="";
  if(req.body.img && !req.file){
    img=req.body.img;
  }else{
    img='/uploads/'+req.file.filename;
  }
  const welcomeModel = new HomeWelcomeModel({
    description: req.body.description,
    welcome_url: req.body.welcome_url,
    image_url: img,
  });

  const homeModel = new HomePageModel({
    welcome: welcomeModel
  });

  HomePageModel.findOne({ __type: 'HomePage' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.welcome = welcomeModel;
      // welcomeModel
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/home');
      });
    } else {
      homeModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/home');
      });
    }
  });
};

exports.postHomeIntro = (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
  var img="";
  if(req.body.img && !req.file){
    img=req.body.img;
  }else{
    img='/uploads/'+req.file.filename;
  }
  const introModel = new HomeIntroModel({
    service: req.body.service,
    description: req.body.description,
    url: req.body.url,
    image: img,
  });

  const homeModel = new HomePageModel({
    intro: [introModel]
  });
  HomePageModel.findOne({ __type: 'HomePage' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      if(req.body.img){
        data.intro[req.body.id]= introModel;
      }else{
        data.intro = [...data.intro, ...homeModel.intro];
      }
      
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/home');
      });
    } else {
      homeModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/home');
      });
    }
  });
};
exports.deleteHomeIntro = (req, res, next) => {
  HomePageModel.findOne({ __type: 'HomePage' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.intro.splice(req.body.id, 1);
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/home');
      });
    }
  });

};





