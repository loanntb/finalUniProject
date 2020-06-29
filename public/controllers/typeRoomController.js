
const typeRoom = require('../models/categoryModel');

/**
 * GET /
 * Type page.
 */

exports.index = (req, res) => {
  typeRoom.find(function (err, data) {
    if (err) {return next(err);}
    if (!data) {
      data = new typeRoom();
    }
    res.render('pages/typeroom', {
      title: 'Type Room',
      data
    });
    console.log(data);
  });
};

exports.typeRoom = async(req, res, next) => {
  const {id} = req.params;
  console.log(id);
  const type = await typeRoom.find();
  typeRoom
    .findById(id).
    exec((err, datatype) => {
      res.render('category', {
        title: 'Category',
        datatype,
        type
      });
      console.log(datatype);
    });
};

exports.homepage = (req, res) => {
  typeRoom.find((err, dataroom) => {
    if (err) {return next(err);}
    if (!dataroom) {
      dataroom = new typeRoom({
        "name": "Phòng Standard (STD)",
        "image": "/uploads/room-1591068347322.jpg",
        "description": "Standard - phòng tiêu chuẩn trong khách sạn, là loại phòng đơn giản nhất với những trang bị tối thiểu, có diện tích nhỏ, ở tầng thấp, không có view hoặc view không đẹp. Đây là loại phòng có mức giá thấp nhất trong khách sạn. Một số khách sạn sẽ không có loại phòng standard vì tất cả các phòng đều có view đẹp và được trang bị những thiết bị tiện nghi nhất."
      });
    }
    res.render('typeroom', {
      title: 'Type Room',
      dataroom
    });

  });

};


/**
 * Post /
 * Home Type Room.
 */
exports.postCategoryRoom = (req, res, next) => {
  let img = "";
  if (req.body.img && !req.file) {
    img = req.body.img;
  } else {
    img = '/uploads/' + req.file.filename;
  }
  const typeRoomModel = new typeRoom({
    name: req.body.name,
    image: img,
    description: req.body.description
  });
  typeRoomModel.save((err) => {
    if (err) {return next(err);}
    req.flash('success', {msg: 'Thêm loại phòng mới thành công'});
    res.redirect('/pages/typeroom');
  });
  console.log(typeRoomModel);
};

/**
 * DELETE /
 * Room page.
 */
exports.deleteCategoryRoom = (req, res, next) => {
  typeRoom.findOne((err, data) => {
    if (err) {return next(err);}
    if (data) {
      data.splice(req.body.page_number * 10 + parseInt(req.body.id), 1);
      data.save((err) => {
        if (err) {return next(err);}
        req.flash('success', {msg: 'Đã xóa loại phòng.'});
        res.redirect('pages/typeroom');
      });
    }
  });

};
