const room = require('../models/roomModel');
const booking = require('../models/bookModel');
const category = require('../models/categoryModel');


/**
 * GET /
 * Home page.
 */

exports.index = async (req, res, next) => {
  try {
    const typeroom = await category.find()
    room.find((err, data) => {
      if (err) {return next(err);}
      if (!data) {
        data = new room();
      }
      res.render('pages/room', {
        title: 'Room',
        data,
        typeroom
      });
    });
  } catch (err) {
    next(err);
  }

};

exports.homepage = async (req, res, next) => {
  await room
    .find()
    .exec((err, dataroom) => {
      if (err) return handleError(err);
      res.render('room', {
        title: 'Room',
        dataroom
      });
    });
};


/**
 * GET /
 * Room by ID.
 */

exports.getbookID = async (req, res, next) => {
  const {id} = req.params;
  const type = await category.find();
  room
    .findById(id)
    .exec((err, roomId) => {
      if (err) return handleError(err);
      res.render('roomid', {
        title: 'Room',
        roomId,
        type
      });
      console.log(type);
    });
};

/**
 * GET /
 * Room Gallery.
 */

exports.getGallery = (req, res) => {
  room
    .find()
    .exec((err, data) => {
      if (err) return handleError(err);
      res.render('gallery', {
        title: 'Gallery',
        data
      });
    });
};

exports.getSearchPage = async (req, res, next) => {
  const checkout = req.body.checkout;
  const checkin = req.body.checkin;
  const newBookingStart = moment.utc(checkin);
  const newBookingEnd = moment.utc(checkout);
  const book = await await booking.find({$and: [{'checkin': {$gte: checkin, $lte: checkout}}, {'checkout': {$gte: checkin, $lte: checkout}}]})
  console.log(checkin, checkout,book);
    if (!book.length)  {
      await room
      .find()
      .exec((err, dataroom) => {
        if (err) return handleError(err);
        res.render('searchroom', {
          title: 'Search',
          dataroom,
          newBookingStart,
          newBookingEnd
        });
      });  
    }else{
      res.render('404', {title: '404'});
    }
  
};

exports.getbookSearchID = async (req, res, next) => {
  const {id} = req.params;
  const type = await category.find();
  room
    .findById(id)
    .exec((err, roomId) => {
      if (err) return handleError(err);
      res.render('searchRoomid', {
        title: 'Room',
        roomId,
        type
      });
      console.log(type);
    });
};
/**
 * Post /
 * Home Room.
 */
exports.postHomeRoom = async (req, res, next) => {
  const {
    type, name, floor, convenient, description, area, amount_bed, people, price
  } = req.body;
  let img = '';
  if (req.body.img && !req.file) {
    img = req.body.img;
  } else {
    img = `/uploads/${req.file.filename}`;
  }

  const roomModel = new room({
    name,
    floor,
    type,
    convenient,
    description,
    area,
    amount_bed,
    people,
    image: img,
    price: price
  });
  roomModel.save((err, data) => {
    if (err) {return next(err);}
    req.flash('success', {msg: 'Thêm phòng mới thành công'});
    res.redirect('/pages/room');
  });
};
/**
 * DELETE /
 * Room page.
 */
exports.deleteHomeRoom = async (req, res, next) => {
  const roomId = req.params.id
  console.log(roomId)
  room.deleteOne({_id: roomId})
    .catch(

      res.redirect('/pages/room')

    )
    .then(err =>
      next(err)
    )

  // await room.findOne((err, data) => {
  //   if (err) {
  //     return next(err);
  //   }
  //   if (data) {
  //     data.splice(req.body.id, 1);
  //     data.save((err) => {
  //       if (err) {return next(err);}
  //       req.flash('success', {msg: 'Xóa thành công'});
  //       res.redirect('/pages/room');
  //     });
  //   }
  // });
};


exports.postBookRoom = (req, res, next) => {
  // const { checkin, checkout, price, name } = req.body;
  // const newBookingStart = moment.utc(checkin);
  // const newBookingEnd = moment.utc(checkout);
  // const duration = newBookingEnd.diff(newBookingStart, 'days', true);
  // const total_price = price * duration;
  //   const roomModel = new RoomBookModel({
  //     checkin: newBookingStart,
  //     checkout: newBookingEnd,
  //     people: req.body.people,
  //     duration: duration,
  //     identity_card: req.body.identity_card,
  //     phone: req.body.phone,
  //     email: req.body.email,
  //     roomId: req.body.name,
  //     total_price:total_price
  //   });
  //   const homeRoomModel = new HomeRoomModel({
  //     book: [roomModel]
  //   }

  //   );
  // HomeRoomModel.findOne({ __type: 'Room' },
  // (err, data) => {
  //   if (err) { return next(err); }
  //   if (data) {
  //       const bookArr = [...data.book];
  //       const bookId = []
  //       console.log(bookArr);
  //       bookArr.forEach(function(item, index, array) {
  //         if(item.name = name ){
  //           bookId.push(item);
  //        }else{
  //          console.log("Lỗi");
  //        }
  //       });
  //     data.book = [...data.book, ...homeRoomModel.book];
  //     const existingBookingStart = data.book.checkin;
  //     const existingBookingEnd = data.book.checkout;
  //     console.log(existingBookingStart);
  //     // if(newBookingStart >= existingBookingStart && newBookingStart < existingBookingEnd ||
  //     //   existingBookingStart >= newBookingStart && existingBookingStart < newBookingEnd) {
  //     //    console.log("existing");
  //     // }else{
  //       console.log(homeRoomModel);
  //       homeRoomModel.save((err) => {
  //       if (err) { return next(err); }
  //       //req.flash('success', { msg: 'Đặt phòng thành công.' });
  //       res.redirect('/room');
  //     });
  //     // }
  //   } else {
  //     // if(newBookingStart >= existingBookingStart && newBookingStart < existingBookingEnd ||
  //     //   existingBookingStart >= newBookingStart && existingBookingStart < newBookingEnd) {
  //     //     console.log("existing")
  //     // }else{
  //     //   homeRoomModel.save((err) => {
  //     //   if (err) { return next(err); }
  //     //   // req.flash('success', { msg: 'Đặt phòng thành công.' });
  //     //   // res.redirect('/');
  //     // });
  //     // }
  //   }
  // });
  // //  ContactModel.findOne({ __type: 'contact' }, (err, data) => {
  // //   email = data.email;
  // //   console.log(data);
  // //   let transporter = nodemailer.createTransport({
  // //     service: 'Gmail',
  // //     auth: {
  // //       user: email.email,
  // //       pass: email.password

  // //     }
  // //   });
  // //   const mailOptions = {
  // //     to: email.email,
  // //     from: email.email,//process.env.SENDGRID_USER
  // //     subject: 'Bạn có lượt đặt phòng mới',
  // //     text: `Thông tin đặt phòng \n
  // //        Tên phòng :${req.body.name} \n
  // //        Loại phòng :${req.body.type} \n
  // //        Ngày đên :${req.body.checkin} \n
  // //        Ngày đi :${req.body.checkout} \n
  // //        Số ngày :${duration} \n
  // //        Giá :${total_price} \n
  // //        Số người :${req.body.people} \n
  // //        CMTND :${req.body.identity_card} \n
  // //        Số điện thoại :${req.body.phone} \n
  // //        Email :${req.body.email} \n`
  // //   };
  // //   transporter.sendMail(mailOptions, function (error, info) {
  // //     if (error) {
  // //       console.log(error);
  // //     } else {
  // //       console.log('Email sent: ' + info.response);
  // //     }
  // //   });
  // // });
  // // HomeRoomModel.findOne({ __type: 'book' }, (err, data) => {
  // //   email = data.book.email;
  // //   console.log(email);
  // //   if (!data) { return; }
  // //   let transporter = nodemailer.createTransport({
  // //     service: 'Gmail',
  // //     auth: {
  // //       user: "qlks2020@gmail.com",
  // //       pass: "qLKS2020@"
  // //     }
  // //   });
  // //   const mailOptions = {
  // //     to: 'selinadhv11904@gmail.com',
  // //     from: 'qlks2020@gmail.com',//process.env.SENDGRID_USER
  // //     subject: 'Thông tin đặt phòng',
  // //     text: `Thông tin đặt phòng \n
  // //     Tên phòng :${req.body.name} \n
  // //     Loại phòng :${req.body.type} \n
  // //     Ngày đên :${req.body.checkin} \n
  // //     Ngày đi :${req.body.checkout} \n
  // //     Số ngày :${duration} \n
  // //     Giá :${total_price} \n
  // //     Số người :${req.body.people} \n
  // //     CMTND :${req.body.identity_card} \n
  // //     Số điện thoại :${req.body.phone} \n
  // //     Email :${req.body.email} \n`
  // //   };
  // //   transporter.sendMail(mailOptions, function (error, info) {
  // //     if (error) {
  // //       console.log(error);
  // //     } else {
  // //       console.log('Email sent: ' + info.response);
  // //     }
  // //   });
  // // });

};

/**
 * Delete /
 * Book Room.
 */
exports.deleteBookRoom = (req, res, next) => {
  // HomeRoomModel.findOne({ __type: 'Room' }, (err, data) => {
  //   if (err) { return next(err); }
  //   if (data) {
  //     data.book.splice(req.body.page_number * 10 + parseInt(req.body.id), 1);
  //     // data.book.splice(req.body.id,1);
  //     data.save((err) => {
  //       if (err) { return next(err); }
  //       res.redirect('/pages/book/room/');
  //     });
  //   }
  // });

};
