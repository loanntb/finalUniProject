
const typeRoom = require('../models/typeRoomModel');
/**
 * GET /
 * Type page.
 */

exports.index = (req, res) => {
    typeRoom.find(function(err, data){
    if (err) { return next(err); }
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
exports.homepage = (req, res) => {
    typeRoom.find((err, dataroom) => {
    if (err) { return next(err); }
    if (!dataroom) {
      dataroom = new typeRoom({ "_id" : ObjectId("5ed442a6ed0e352074868dee"),  "typeroom" : "standard",  "price" : 250, "image" : "/uploads/room-1590968998511.jpg", "__v" : 0 });
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
exports.postHomeRoom = (req, res, next) => {
  let img = "";
  if (req.body.img && !req.file) {
    img = req.body.img;
  } else {
    img = '/uploads/' + req.file.filename;
  }
  const typeRoomModel = new typeRoom({
    type: req.body.type,
    price: req.body.price,
    image: img,
  });
  typeRoomModel.save((err) => {
    if (err) { return next(err); }
    req.flash('success', { msg: 'Thêm loại phòng mới thành công' });
    res.redirect('/pages/typeroom');
  });
console.log(typeRoomModel);
};
/**
 * DELETE /
 * Room page.
 */
exports.deleteHomeRoom = (req, res, next) => {
    typeRoom.findOne( (err, data) => {
    if (err) { 
      return next(err); 
    }
    if (data) {
      data.splice(req.body.id, 1);
      data.save((err) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'Xóa loại phòng thành công' });
        res.redirect('/pages/typeroom');
      });
    }
  });

};
