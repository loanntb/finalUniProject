const nodemailer = require('nodemailer');
const { ContactModel, contactModel, HomecontactModel } = require('../models/contactModel');

/**
 * GET /contact
 * Contact form page.
 */
exports.getContact = (req, res) => {
  //const unknownUser = !(req.user);
  //for home
  ContactModel.findOne({ __type: 'contact' }, (err, data) => {
    if (err) { return next(err); }
    if (!data) {
      data = new ContactModel({ "_id": { "$oid": "5c9852e6d3a8d619384921e9" }, "__type": "Contact", "info": { "address": "Số 32, Phong Đình Cảng, Thành phố Vinh, tỉnh Nghệ An", "phone": "096 716 6879", "description": "Quản Lý khách sạn - Đồ Án", "email": "admin@admin.com", "openhour": "7H- 20H", "image": "/uploads/contact-1554189528245.jpg" }, "contact": [], "__v": 8 }
      );
    }
    if (!data.info) {
      data.info = new HomecontactModel();
    }
    res.render('contact', {
      title: 'Contact',
      data
    });

  });

};
exports.index = (req, res) => {
  ContactModel.findOne({ __type: 'contact' }, (err, data) => {
    if (err) { return next(err); }
    if (!data) {
      data = new ContactModel();
    }
    if (!data.info) {
      data.info = new HomecontactModel();
    }
    res.render('pages/contact', {
      title: 'Contact',
      data,
    });
  });

};

exports.postHomeContact = (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
  var img = "";
  if (req.body.img && !req.file) {
    img = req.body.img;
  } else {
    img = '/uploads/' + req.file.filename;
  }
  const contactModel = new HomecontactModel({
    address: req.body.address,
    phone: req.body.phone,
    description: req.body.description,
    email: req.body.email,
    openhour: req.body.openhour,
    image: img,
  });

  const homeContactModel = new ContactModel({
    info: contactModel
  }
  );
  ContactModel.findOne({ __type: 'contact' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.info = contactModel;
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/contact');
      });
    } else {
      homeContactModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/contact');
      });
    }
  });
};
exports.postContact = (req, res) => {
  console.log(req.body);
  const contactsModel = new contactModel({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    msessage: req.body.message,
  });

  const homeContactModel = new ContactModel({
    contact: [contactsModel]
  }
  );

  ContactModel.findOne({ __type: 'contact' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.contact = [...data.contact, ...homeContactModel.contact];
      data.save((err) => {
        if (err) { return next(err); }
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
          subject: 'Bạn có tin nhắn mới',
          text: `Tên người gửi :${req.body.name} \n
      Số điện thoại :${req.body.phone} \n
      Email :${req.body.email} \n
      Lời nhắn :${req.body.message} \n`
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        res.redirect('/contact');
      });
    } else {
      homeContactModel.save((err) => {
        if (err) { return next(err); }
        res.redirect('/contact');
      });
    }
  });
};
exports.deleteContact = (req, res, next) => {
  ContactModel.findOne({ __type: 'contact' }, (err, data) => {
    if (err) { return next(err); }
    if (data) {
      data.contact.splice(req.body.id, 1);
      data.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pages/contact');
      });
    }
  });

};
