
const { MenuModel, HomeBookModel, HomeMenuModel, } = require('../models/menuModel');
const nodemailer = require('nodemailer');
const { ContactModel } = require('../models/contactModel');
/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  HomeMenuModel.findOne({ __type: 'Menu' }, (err, data) => {
    if (err) { return next(err); }
    if (!data) {
      data = new HomeMenuModel();
    }
    res.render('pages/menu', {
      title: 'Menu',
      data
    });
   
  });

};
exports.menu = (req, res) => {
  HomeMenuModel.findOne({ __type: 'Menu' }, (err, data) => {
    if (err) { return next(err); }
    if (!data) {
      data = new HomeMenuModel({ "_id": { "$oid": "5c92fca7c68287256091c69b" }, "__type": "Menu", "book": [], "menu": [{ "type": "Đồ uống", "name": "Trà sữa", "description": "màu xanh", "price": "12" }, { "type": "Món ăn", "name": "Rau muống", "description": "Xanh", "price": "12" }], "__v": 24, "drink": [{ "name": "Sinh tố bơ", "description": "Bơ sáp Tây Nguyên", "price": "30" }, { "name": "Nước ép ổi", "description": "Ổi từ siêu thị an toàn", "price": "40" }], "food": [{ "name": "Rao muống xào", "description": "Rau từ nông trại Ba Vì", "price": "50" }, { "name": "Bánh đa", "description": "Đặc sản Đô Lương", "price": "100" }] }
      );
    }
    res.render('menu', {
      title: 'Menu',
      data
    });
    console.log(data);
  });

};
exports.getbook = (req, res) => {
  HomeMenuModel.findOne({ __type: 'Menu' }, (err, data) => {
    if (err) { return next(err); }
    if (!data) {
      data = new HomeMenuModel();
    }
    var page_size = 10;
    var count = Math.ceil(data.book.length / page_size);
    var page_number = req.params.page > 0 ? req.params.page : 0;
    data.book = data.book.slice(page_number * page_size, (page_number + 1) * page_size);
    res.render('pages/booktable', {
      title: 'Menu',
      data, count, page_number
    });
  });

};
exports.postHomeBookTable = (req, res, next) => {
  console.log(req.body);
  const booktableModel = new HomeBookModel({
    date: req.body.date,
    name: req.body.name,
    time: req.body.time,
    phone: req.body.phone,
    email: req.body.email,
    people: req.body.people

  });

  const bookModel = new HomeMenuModel({
    book: [booktableModel]
  });
  ContactModel.findOne({ __type: 'contact' }, (err, data) => {
    email = data.email;
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: email.email,
        pass: email.password
      }
    });
    const mailOptions = {
      to: email.email,
      from: email.email,//process.env.SENDGRID_USER
      subject: 'Bạn có lượt đặt bàn mới',
      text: `Thông tin đặt bàn \n 
           Ngày  :${req.body.date} \n
           Tên người đặt :${req.body.name} \n
           Thời gian :${req.body.time} \n
           Số người :${req.body.people} \n
           Số điện thoại :${req.body.phone} \n
           Email :${req.body.email} \n`
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });
  // 
  HomeMenuModel.findOne({ __type: 'Menu' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.book = [...data.book, ...bookModel.book];
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/');
      });
    } else {
      bookModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/');
      });
    }
  });
};
exports.postMenu = (req, res, next) => {
  console.log(req.body);
  const menuModel = new MenuModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price
  });
  const homeMenuModel = new HomeMenuModel();
  if (req.body.type == "drink") {
    homeMenuModel.drink = [menuModel];

  } else {
    homeMenuModel.food = [menuModel];
  }

  HomeMenuModel.findOne({ __type: 'Menu' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      if (data.drink[req.body.id]||data.food[req.body.id]) {
        if (req.body.type == "drink") {
          data.drink[req.body.id] = menuModel;
        } else {
          data.food[req.body.id] = menuModel;
        }
      } else {
        if (req.body.type == "drink") {
          data.drink = [...data.drink, ...homeMenuModel.drink];
        } else {
          data.food = [...data.food, ...homeMenuModel.food];
        }
      }
      data.save((err) => {
        if (err) { 
          console.log(err);
          return next(err); }
        res.redirect('/pages/menu');
      });
    } else {
      homeMenuModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/menu');
      });
    }
  });
};
exports.deleteMenu = (req, res, next) => {
  console.log(req.body);
  HomeMenuModel.findOne({ __type: 'Menu' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      if (req.body.type == 'drink') {
        data.drink.splice(req.body.id, 1);
      } else {
        data.food.splice(req.body.id, 1);
      }

      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/menu');
      });
    }
  });
  // console.log(req.body);
};
exports.deleteBookTable = (req, res, next) => {

  HomeMenuModel.findOne({ __type: 'Menu' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      console.log(req.body.page_number * 10 + parseInt(req.body.id));
      data.book.splice(req.body.page_number * 10 + parseInt(req.body.id), 1);
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/book/table');
      });
    }
  });

};


