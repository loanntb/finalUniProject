const book = require('../models/bookModel');
const room = require('../models/roomModel');
const nodemailer = require('nodemailer');
const {ContactModel} = require('../models/contactModel');
const moment = require('moment');


/**
 * GET /
 * Book room.
 */
exports.getbook = (req, res) => {
  book.
    find().
    populate('roomId').
    exec(function (err, data) {
      if (err) return handleError(err);
      console.log(data.roomId);
      //console.log(data);
      const page_size = 10;
      const count = Math.ceil(data.length / page_size) > 0 ? Math.ceil(data.length / page_size) : 0;
      const page_number = req.params.page > 0 ? req.params.page : 0;
      data = data.slice(page_number * page_size, (page_number + 1) * page_size);
      res.render('pages/bookroom', {
        title: 'Room',
        data,
        count, page_number
      });
      console.log(data)
    });

};
/**
 * Post /
 * Book Room.
 */

exports.postSearchBookRoom = async (req, res, next) => {
  const {checkin, checkout, people, email, name, price} = req.body;
  const newBookingStart = moment.utc(checkin);
  const newBookingEnd = moment.utc(checkout);
  console.log(checkin);
  const duration = newBookingEnd.diff(newBookingStart, 'days', true).toFixed(0);
  const total_price = price * duration;
  //newBookingStart >= existingBookingStart && newBookingStart < existingBookingEnd || 
  //existingBookingStart >= newBookingStart && existingBookingStart < newBookingEnd
  const check = await book.find({$and: [{'checkin': {$gte: checkin, $lte: checkout}}, {'checkout': {$gte: checkin, $lte: checkout}}]})
    if (!check.length) {
      const bookModel = new book({
        checkin: newBookingStart,
        checkout: newBookingEnd,
        people: people,
        duration: duration,
        email: email,
        roomId: name,
        total_price: total_price
      });
      await bookModel.save((err) => {
        if (err) {return next(err);}
        res.redirect('/room');
      });
      // ContactModel.findOne({ __type: 'contact' }, (err, data) => {
      //     email = data.email;
      //     console.log(data);
      //     let transporter = nodemailer.createTransport({
      //       service: 'Gmail',
      //       auth: {
      //         user: email.email,
      //         pass: email.password
      
      //       }
      //     });
      //     const mailOptions = {
      //       to: email.email,
      //       from: email.email,//process.env.SENDGRID_USER
      //       subject: 'Bạn có lượt đặt phòng mới',
      //       text: `Thông tin đặt phòng \n
      //          Tên phòng :${req.body.name} \n
              
      //          Ngày đên :${req.body.checkin} \n
      //          Ngày đi :${req.body.checkout} \n
      //          Số ngày :${duration} \n
      //          Giá :${total_price} \n
      //          Số người :${req.body.people} \n
      //          Email :${req.body.email} \n`
      //     };
      //     transporter.sendMail(mailOptions, function (error, info) {
      //       if (error) {
      //         console.log(error);
      //       } else {
      //         console.log('Email sent: ' + info.response);
      //       }
      //     });
      //   });

}
    else {
      console.log("  co ")
    }

  
}

/**
 * Post /
 * Book Room.
 */

exports.postBookRoom = async (req, res, next) => {
  const {checkin, checkout, people, email, name, price} = req.body;
  const newBookingStart = moment.utc(checkin);
  const newBookingEnd = moment.utc(checkout);
  console.log(checkin);
  const duration = newBookingEnd.diff(newBookingStart, 'days', true).toFixed(0);
  const total_price = price * duration;
  const check = await book.find({$and: [{'checkin': {$gte: checkin, $lte: checkout}}, {'checkout': {$gte: checkin, $lte: checkout}}]})
    if (!check.length) {
      const bookModel = new book({
        checkin: newBookingStart,
        checkout: newBookingEnd,
        people: people,
        duration: duration,
        email: email,
        roomId: name,
        total_price: total_price
      });
      await bookModel.save((err) => {
        if (err) {return next(err);}
        res.redirect('/room');
      });
      // ContactModel.findOne({ __type: 'contact' }, (err, data) => {
      //     email = data.email;
      //     console.log(data);
      //     let transporter = nodemailer.createTransport({
      //       service: 'Gmail',
      //       auth: {
      //         user: email.email,
      //         pass: email.password
      
      //       }
      //     });
      //     const mailOptions = {
      //       to: email.email,
      //       from: email.email,//process.env.SENDGRID_USER
      //       subject: 'Bạn có lượt đặt phòng mới',
      //       text: `Thông tin đặt phòng \n
      //          Tên phòng :${req.body.name} \n
              
      //          Ngày đên :${req.body.checkin} \n
      //          Ngày đi :${req.body.checkout} \n
      //          Số ngày :${duration} \n
      //          Giá :${total_price} \n
      //          Số người :${req.body.people} \n
      //          Email :${req.body.email} \n`
      //     };
      //     transporter.sendMail(mailOptions, function (error, info) {
      //       if (error) {
      //         console.log(error);
      //       } else {
      //         console.log('Email sent: ' + info.response);
      //       }
      //     });
      //   });

}
    else {
      console.log("  co ")
    }

  
}

/**
 * Delete /
 * Book Room.
 */
exports.deleteBookRoom = (req, res, next) => {
  book.findOne((err, data) => {
    if (err) {return next(err);}
    if (data) {
      data.splice(req.body.page_number * 10 + parseInt(req.body.id), 1);
      // data.book.splice(req.body.id,1);
      data.save((err) => {
        if (err) {return next(err);}
        req.flash('success', {msg: 'Đã hủy đặt phòng.'});
        res.redirect('/pages/book/room/');
      });
    }
  });

};