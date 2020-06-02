const book = require('../models/bookModel');
const room = require('../models/roomModel');
const typeRoom = require('../models/typeRoomModel');
const nodemailer = require('nodemailer');
const { ContactModel } = require('../models/contactModel');
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
        //console.log(data.roomId.name);
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
    });
   
  };

/**
 * Post /
 * Book Room.
 */

exports.postBookRoom = async (req, res, next) => {
  const {checkin, checkout,people, price, name} = req.body;
  const newBookingStart = moment.utc(checkin);
  const newBookingEnd = moment.utc(checkout);
  const duration = newBookingEnd.diff(newBookingStart, 'days', true);
  //const total_price = price * duration;
  console.log(name)
    const bookModel = new book({
      checkin: newBookingStart,
      checkout: newBookingEnd,
      people: people,
      duration: duration,
      phone: req.body.phone,
      email: req.body.email,
      roomId: req.body.name,
      total_price:400000
    });
    console.log(bookModel)
    bookModel.save((err) => {
              if (err) { return next(err); }
              //req.flash('success', { msg: 'Đặt phòng thành công.' });
              res.redirect('/room');
            });
//   const lastRoom = await book.findOne();
//   const [room] = lastRoom.room.filter(val => val.name === name);
//   const existBook = await HomeRoomModel.findOne({ __type: 'Room' })
//   console.log(existBook);
}

/**
 * Delete /
 * Book Room.
 */
exports.deleteBookRoom = (req, res, next) => {
    book.findOne( (err, data) => {
      if (err) { return next(err); }
      if (data) {
        data.splice(req.body.page_number * 10 + parseInt(req.body.id), 1);
        // data.book.splice(req.body.id,1);
        data.save((err) => {
          if (err) { return next(err); }
          req.flash('success', { msg: 'Đã hủy đặt phòng.' });
          res.redirect('/pages/book/room/');
        });
      }
    });
  
  };