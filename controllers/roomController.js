
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

exports.getbookID = (req, res) => {
  const id = req.params.id;
  HomeRoomModel.findOne({ __type: 'Room' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      const roomArr = [...data.room]; 
      const roomId = [];
     const roomModel = new RoomModel();
      roomArr.forEach(function(item, index, array) {
        if(item._id = id ){
          roomId.push(item);
       }else{
         console.log("Lỗi 404");
       }
       
      });
      res.render('roomid', {
        title: 'Roomid',
        roomId: roomId[0]
       
      });
      console.log(roomId[0]);
    } else {
     res.redirect('/room');
    }
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
    name: req.body.name,
    floor: req.body.floor,
    type: req.body.type,
    convenient: req.body.convenient,
    description: req.body.description,
    area: req.body.area,
    amount_bed: req.body.amount_bed,
    occupancy: req.body.occupancy,
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
  const { checkin, checkout, price, name } = req.body;
  const newBookingStart = moment.utc(checkin);
  const newBookingEnd = moment.utc(checkout);
  const duration = newBookingEnd.diff(newBookingStart, 'days', true);
  const total_price = price * duration;
    const roomModel = new RoomBookModel({
      checkin: newBookingStart,
      checkout: newBookingEnd,
      people: req.body.people,
      duration: duration,
      identity_card: req.body.identity_card,
      phone: req.body.phone,
      email: req.body.email,
      roomId: req.body.name,
      total_price:total_price
    });
    const homeRoomModel = new HomeRoomModel({
      book: [roomModel]
    }
    );
  HomeRoomModel.findOne({ __type: 'Room' },
  (err, data) => {
    if (err) { return next(err); }
    if (data) {
        const bookArr = [...data.book]; 
        const bookId = []
        console.log(bookArr);
        bookArr.forEach(function(item, index, array) {
          if(item.name = name ){
            bookId.push(item);
         }else{
           console.log("Lỗi 404");
         }
        });
      data.book = [...data.book, ...homeRoomModel.book];
      const existingBookingStart = bookId[0].checkin;
      const existingBookingEnd = bookId[0].checkout;
      if(newBookingStart >= existingBookingStart && newBookingStart < existingBookingEnd || 
        existingBookingStart >= newBookingStart && existingBookingStart < newBookingEnd) {
         console.log("existing");
      }else{
        homeRoomModel.save((err) => {
        if (err) { return next(err); }
        //req.flash('success', { msg: 'Đặt phòng thành công.' });
        res.redirect('/');
      });
      }
    } else {
      if(newBookingStart >= existingBookingStart && newBookingStart < existingBookingEnd || 
        existingBookingStart >= newBookingStart && existingBookingStart < newBookingEnd) {
          console.log("existing")
      }else{
        homeRoomModel.save((err) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'Đặt phòng thành công.' });
        res.redirect('/');
      });
      }
    }
  });
  //  ContactModel.findOne({ __type: 'contact' }, (err, data) => {
  //   email = data.email;
  //   console.log(data);
  //   let transporter = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: email.email,
  //       pass: email.password
        
  //     }
  //   });
  //   const mailOptions = {
  //     to: email.email,
  //     from: email.email,//process.env.SENDGRID_USER
  //     subject: 'Bạn có lượt đặt phòng mới',
  //     text: `Thông tin đặt phòng \n 
  //        Tên phòng :${req.body.name} \n
  //        Loại phòng :${req.body.type} \n
  //        Ngày đên :${req.body.checkin} \n
  //        Ngày đi :${req.body.checkout} \n
  //        Số ngày :${duration} \n
  //        Giá :${total_price} \n
  //        Số người :${req.body.people} \n
  //        CMTND :${req.body.identity_card} \n
  //        Số điện thoại :${req.body.phone} \n
  //        Email :${req.body.email} \n`
  //   };
  //   transporter.sendMail(mailOptions, function (error, info) {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log('Email sent: ' + info.response);
  //     }
  //   });
  // });
  // HomeRoomModel.findOne({ __type: 'book' }, (err, data) => {
  //   email = data.book.email;
  //   console.log(email);
  //   if (!data) { return; }
  //   let transporter = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: "qlks2020@gmail.com",
  //       pass: "qLKS2020@"
  //     }
  //   });
  //   const mailOptions = {
  //     to: 'selinadhv11904@gmail.com',
  //     from: 'qlks2020@gmail.com',//process.env.SENDGRID_USER
  //     subject: 'Thông tin đặt phòng',
  //     text: `Thông tin đặt phòng \n
  //     Tên phòng :${req.body.name} \n
  //     Loại phòng :${req.body.type} \n
  //     Ngày đên :${req.body.checkin} \n
  //     Ngày đi :${req.body.checkout} \n
  //     Số ngày :${duration} \n
  //     Giá :${total_price} \n
  //     Số người :${req.body.people} \n
  //     CMTND :${req.body.identity_card} \n
  //     Số điện thoại :${req.body.phone} \n
  //     Email :${req.body.email} \n`   
  //   };
  //   transporter.sendMail(mailOptions, function (error, info) {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log('Email sent: ' + info.response);
  //     }
  //   });
  // });
  
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
