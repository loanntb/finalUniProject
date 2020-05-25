
const { HomeRoomModel, RoomModel, RoomBookModel } = require('../models/roomModel');
const nodemailer = require('nodemailer');
const { ContactModel } = require('../models/contactModel');
const moment = require('moment');
/**
 * GET /
 * Home page.
 */

exports.index = (req, res) => {
  HomeRoomModel.findOne({ __type: 'Room' }, (err, data) => {
    if (err) { return next(err); }
    if (!data) {
      data = new HomeRoomModel();
    }
    res.render('pages/room', {
      title: 'Room',
      data
    });

  });

};
exports.homepage = (req, res) => {
  HomeRoomModel.findOne({ __type: 'Room' }, (err, dataroom) => {
    if (err) { return next(err); }
    if (!dataroom) {
      dataroom = new HomeRoomModel({ "_id": { "$oid": "5c91b8434ff8af1fc86ee8fd" }, "__type": "Room", "__v": 34, "room": [{ "type": "Thương gia", "convenient": "city view", "description": "Đẹp", "area": "1", "amount": "1", "amount_bed": "1", "url": "dsad", "image": "/images/room.jpg" }, { "type": "Phòng đơn", "convenient": "Có wifi, máy lạnh,...", "description": "Một giường ngủ , Giá : 50k/h", "area": "20", "amount": "10", "amount_bed": "1", "url": "dfgdfg", "image": "/images/room.jpg" }], "book": [] });
    }
    res.render('room', {
      title: 'Room',
      dataroom
    });

  });

};
exports.getbook = (req, res) => {
  HomeRoomModel.findOne({ __type: 'Room' }, (err, data) => {
    if (err) { return next(err); }
    if (!data) {
      data = new HomeRoomModel();
    }
    var page_size = 10;

    var count = Math.ceil(data.book.length / page_size) > 0 ? Math.ceil(data.book.length / page_size) : 0;
    var page_number = req.params.page > 0 ? req.params.page : 0;
    data.book = data.book.slice(page_number * page_size, (page_number + 1) * page_size);
    res.render('pages/bookroom', {
      title: 'Room',
      data,
      count, page_number
    });


  });

};

exports.postHomeRoom = (req, res, next) => {
  var img = "";
  if (req.body.img && !req.file) {
    img = req.body.img;
  } else {
    img = '/uploads/' + req.file.filename;
  }
  const roomModel = new RoomModel({
    name: req.body.name ,
    floor: req.body.floor,
    type: req.body.type,
    convenient: req.body.convenient,
    description: req.body.description,
    area: req.body.area,
    amount_bed: req.body.amount_bed,
    price: req.body.price,
    image: img,
  });

  const homeRoomModel = new HomeRoomModel({
    room: [roomModel]
  }
  );
  HomeRoomModel.findOne({ __type: 'Room' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      if (req.body.img) {
        data.room[req.body.id] = roomModel;
      } else {
        data.room = [...data.room, ...homeRoomModel.room];
      }
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/room');
      });
    } else {
      homeRoomModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/room');
      });
    }
  });
};
exports.deleteHomeRoom = (req, res, next) => {
  HomeRoomModel.findOne({ __type: 'Room' }, (err, data) => {
    if (err) { 
      return next(err); 
    }
    if (data) {
      data.room.splice(req.body.id, 1);
      data.save((err) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'Xóa thành công' });
        res.redirect('/pages/room');
      });
    }
  });

};
exports.postBookRoom = (req, res, next) => {
  let checkin = req.body.checkin;
  let checkout = req.body.checkout;
  let date1 = parseInt(checkin);
  let date2 = parseInt(checkout);
  var diffDays = Math.ceil((date2 - date1) / (1000 * 3600 * 24)); //gives day difference 
  console.log(date1);
  console.log(diffDays);
  
  const roomModel = new RoomBookModel({
    checkin: checkin,
    checkout: checkout,
    room_type: req.body.room_type,
    people: req.body.people,
    duration: diffDays,
    identity_card: req.body.identity_card,
    phone: req.body.phone,
    email: req.body.email,
    roomId: req.body.name
  });
  const homeRoomModel = new HomeRoomModel({
    book: [roomModel]
  }
  );
  HomeRoomModel.findOne({ __type: 'Room' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      console.log(data.book);
      data.book = [...data.book, ...homeRoomModel.book];
      data.save((err) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'Đặt phòng ' + req.body.name + ' thành công.' });
        res.redirect('/');
      });
    } else {
      homeRoomModel.save((err) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'Đặt phòng ' + req.body.name + ' thành công.' });
        res.redirect('/');
      });
    }
  });
  ContactModel.findOne({ __type: 'contact' }, (err, data) => {
    email = data.email;
    console.log(data);
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
      subject: 'Bạn có lượt đặt phòng mới',
      text: `Thông tin đặt phòng \n 
         Ngày đên :${req.body.checkin} \n
         Ngày đi :${req.body.checkout} \n
         Số ngày :${diffDays} \n
         Loại phòng:${req.body.room_type} \n
         Số người :${req.body.people} \n
         CMTND :${req.body.identity_card} \n
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
  HomeRoomModel.findOne({ __type: 'book' }, (err, data) => {
    email = data.book.email;
    console.log(email);
    if (!data) { return; }
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: "qlks2020@gmail.com",
        pass: "qLKS2020@"
      }
    });
    const mailOptions = {
      to: 'selinadhv11904@gmail.com',
      from: 'qlks2020@gmail.com',//process.env.SENDGRID_USER
      subject: 'Thông tin đặt phòng',
      text: `Thông tin đặt phòng \n 
         Ngày đên :${req.body.checkin} \n
         Ngày đi :${req.body.checkout} \n
         Số ngày :${diffDays} \n
         Loại phòng:${req.body.room_type} \n
         Số người :${req.body.people} \n
         CMTND :${req.body.identity_card} \n
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
  
};
exports.deleteBookRoom = (req, res, next) => {
  HomeRoomModel.findOne({ __type: 'Room' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      // console.log(req.body.page_number * 10 + parseInt(req.body.id));
      data.book.splice(req.body.page_number * 10 + parseInt(req.body.id), 1);
      // data.book.splice(req.body.id,1);
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/book/room/');
      });
    }
  });

};

