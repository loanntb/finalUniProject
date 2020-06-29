const shift = require('../models/shiftModel');
const room = require('../models/roomModel');
const booking = require('../models/bookModel');
const category = require('../models/categoryModel');

/**
 * GET /
 * list page.
 */


exports.getBookRoom = async(req, res, next) => {
  const {checkin, checkout} = req.body;
  const check = await booking.find({$and: [{'checkin': {$gte: checkin, $lte: checkout}}, {'checkout': {$gte: checkin, $lte: checkout}}]})
  .populate("roomId")
    if (!check.length) {
      req.flash('success', {msg: 'Tất cả phòng đều trống trong khoảng thời gian này'});
      res.redirect('/mannagement/listroom');
    }else{
      res.render('mannagement/listBookRoom', {
        title: 'Mannagement',
        check,
      });
    }
};
/**
 * GET /
 * Shift page.
 */


exports.getRoom = (req, res) => {
  room.
  find().
  populate('type').
    exec(function (err, data) {
      if (err) return handleError(err);
      const page_size = 10;
      const count = Math.ceil(data.length / page_size) > 0 ? Math.ceil(data.length / page_size) : 0;
      const page_number = req.params.page > 0 ? req.params.page : 0;
      data = data.slice(page_number * page_size, (page_number + 1) * page_size);
      res.render('mannagement/listRoom', {
        title: 'Mannagement',
        data,
        count, page_number
      });
      console.log(data);
    });

};

/**
 * GET /
 * Shift page.
 */


exports.getShift = (req, res) => {
    shift.
      find().
      exec(function (err, data) {
        if (err) return handleError(err);
        const page_size = 10;
        const count = Math.ceil(data.length / page_size) > 0 ? Math.ceil(data.length / page_size) : 0;
        const page_number = req.params.page > 0 ? req.params.page : 0;
        data = data.slice(page_number * page_size, (page_number + 1) * page_size);
        res.render('mannagement/shift', {
          title: 'Mannagement',
          data,
          count, page_number
        });
      });
  
  };


exports.postShift = (req, res, next) => {
  const { name } = req.body;
  console.log(name);
//   req.assert('name', 'Tên không được để trống').notEmpty();
//   req.assert('salary', 'Lương không được để trống').notEmpty();
//   req.assert('timeStart', 'Thời gian bắt đầu làm việc không được để trống').notEmpty();
//   req.assert('timeEnd', 'Thời gian kết thúc không được để trống').notEmpty();
//   req.assert('coefficient', 'Hệ số lương không được để trống').notEmpty();

//   const errors = req.validationErrors();
//   if (errors) {
//     req.flash('errors', errors);
//     res.redirect('/mannagement/shift');
//   }

//   const shiftModel = new shift({
//     name, salary, timeStart, timeEnd, coefficient
//   });
//   console.log(name);
//   shiftModel.save((err, data) => {
//     if (err) {return next(err);}
//     req.flash('success', {msg: 'Thêm ca mới thành công'});
//     res.redirect('/mannagement/shift');
//   });
};


exports.deleteShift = (req, res, next) => {
  shift.find( (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.splice(req.body.id, 1);
      console.log(req.body.id);
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('mannagement/shift');
      });
    }
  });

};





