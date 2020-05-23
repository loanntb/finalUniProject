const { promisify } = require('util');
const crypto = require('crypto');
//const nodemailer = require('npm');
const passport = require('passport');
const User = require('../models/userModel');
const toTitleCase = require('../utils/toTitleCase');
const { ContactModel, EmailModel } = require('../models/contactModel');
const randomBytesAsync = promisify(crypto.randomBytes);
/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('email', 'Email không hợp lệ').isEmail();
  req.assert('password', 'Mật khẩu không thể để trống').notEmpty();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Bạn đã đăng nhập thành công!' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (err) console.log('Error : Failed to destroy the session during logout.', err);
    req.user = null;
    res.redirect('/');
  });
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Tạo mới tài khoản'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email không hợp lệ').isEmail();
  req.assert('password', 'Mật khẩu phải dài ít nhất 4 ký tự').len(4);
  req.assert('confirmPassword', 'Mật khẩu không khớp').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    role: ""
  });
  // console.log(checkFirstSignup());
  // if(this.checkFirstSignup()){
  //   console.log(this.checkFirstSignup());
  //   user.role="Admin";
  // }
  User.findOne({}, (err, data) => {
    if (!data) {
      user.role = "Admin";
    }
  });
  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      req.flash('errors', { msg: 'Tài khoản với địa chỉ email này đã tồn tại.' });
      return res.redirect('/signup');
    }
    user.save((err) => {
      if (err) { return next(err); }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
      req.flash('info', { msg: `Đăng ký thành công!` });
    });
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.render('account/profile', {
    title: 'My Account Management'
  });
};
exports.getListAccount = (req, res) => {
  //for admin
  User.find({}, (err, data) => {
    console.log(data);
    if (err || !data) { return next(err); }
    res.render('pages/account', {
      title: 'Account Management',
      data
    });
  });
};


/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  req.assert('email', 'Vui lòng nhập một địa chỉ email hợp lệ.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.phone = req.body.phone || '';
    // user.profile.location = req.body.location || '';
    // user.profile.website = req.body.website || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'Địa chỉ email bạn đã nhập đã được liên kết với một tài khoản.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Thông tin hồ sơ của bạn đã được cập nhật.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'Mật khẩu phải dài ít nhất 4 ký tự').len(4);
  req.assert('confirmPassword', 'Mật khẩu không khớp').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Mật khẩu đã được thay đổi.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.deleteOne({ _id: req.body.id }, (err) => {
    if (err) { return next(err); }
    req.flash('info', { msg: 'Account ' + req.body.email + ' đã bị xóa.' });
    res.redirect('/pages/account');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
  const { provider } = req.params;
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    const lowerCaseProvider = provider.toLowerCase();
    const titleCaseProvider = toTitleCase(provider);
    user[lowerCaseProvider] = undefined;
    const tokensWithoutProviderToUnlink = user.tokens.filter(token =>
      token.kind !== lowerCaseProvider);
    // Some auth providers do not provide an email address in the user profile.
    // As a result, we need to verify that unlinking the provider is safe by ensuring
    // that another login method exists.
    if (
      !(user.email && user.password)
      && tokensWithoutProviderToUnlink.length === 0
    ) {
      req.flash('errors', {
        msg: ` ${titleCaseProvider} Tài khoản này không thể được hủy liên kết mà không có hình thức đăng nhập khác được kích hoạt.`
          + ' Vui lòng liên kết tài khoản khác hoặc thêm địa chỉ email và mật khẩu.'
      });
      return res.redirect('/account');
    }
    user.tokens = tokensWithoutProviderToUnlink;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `${titleCaseProvider} tài khoản đã được hủy liên kết.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Mã thông báo đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset',
        token: req.params.token
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Mật khẩu phải dài ít nhất 4 ký tự.').len(4);
  req.assert('confirm', 'Mật khẩu không khớp.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  const resetPassword = () =>
    User
      .findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires').gt(Date.now())
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Mã thông báo đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
          return res.redirect('back');
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        return user.save().then(() => new Promise((resolve, reject) => {
          req.logIn(user, (err) => {
            if (err) { return reject(err); }
            resolve(user);
          });
        }));
      });

  const sendResetPasswordEmail = (user) => {
    if (!user) { return; }
    let transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const mailOptions = {
      to: user.email,
      from: process.env.SENDGRID_USER,
      subject: 'Tài khoản của bạn trong mật khẩu hệ thống quản lý khách sạn đã được thay đổi',
      text: `Chào bạn,\n\nĐây là một xác nhận rằng mật khẩu cho tài khoản của bạn ${user.email} vừa được thay đổi.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('success', { msg: 'Thành công! Mật khẩu của bạn đã được thay đổi.' });
      })
      .catch((err) => {
        if (err.message === 'self signed certificate in certificate chain') {
          console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
          transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: process.env.SENDGRID_USER,
              pass: process.env.SENDGRID_PASSWORD
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          return transporter.sendMail(mailOptions)
            .then(() => {
              req.flash('success', { msg: 'Thành công! Mật khẩu của bạn đã được thay đổi.' });
            });
        }
        console.log('ERROR: Could not send password reset confirmation email after security downgrade.\n', err);
        req.flash('warning', { msg: 'Mật khẩu của bạn đã được thay đổi, tuy nhiên chúng tôi không thể gửi cho bạn email xác nhận. Chúng tôi sẽ xem xét nó trong thời gian ngắn.' });
        return err;
      });
  };

  resetPassword()
    .then(sendResetPasswordEmail)
    .then(() => { if (!res.finished) res.redirect('/'); })
    .catch(err => next(err));
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Vui lòng nhập một địa chỉ email hợp lệ.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  const createRandomToken = randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    User
      .findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Tài khoản với địa chỉ email này không tồn tại.' });
        } else {
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user = user.save();
        }
        return user;
      });

  const sendForgotPasswordEmail = (user) => {
    if (!user) { return; }
    const token = user.passwordResetToken;
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
        
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'qlks2020@gmail.com',//process.env.SENDGRID_USER
      subject: 'Đặt lại mật khẩu của bạn trong hệ thống Quản Lý Khách sạn',
      text: `Bạn nhận được email này vì bạn (hoặc người khác) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n
      Vui lòng nhấp vào liên kết sau hoặc dán liên kết này vào trình duyệt của bạn để hoàn tất quy trình:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        Nếu bạn không yêu cầu điều này, xin vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('info', { msg: `Một email vừa được gửi tới ${user.email} với lời hướng dẫn cách thay đổi mật khẩu.` });
      })
      .catch((err) => {
        if (err.message === 'self signed certificate in certificate chain') {
          console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
          transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: process.env.SENDGRID_USER,
              pass: process.env.SENDGRID_PASSWORD
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          return transporter.sendMail(mailOptions)
            .then(() => {
              req.flash('info', { msg: `Một email vừa được gửi tới ${user.email} với lời hướng dẫn cách thay đổi mật khẩu.` });
            });
        }
        console.log('ERROR: Could not send forgot password email after security downgrade.\n', err);
        req.flash('errors', { msg: 'Lỗi gửi tin nhắn đặt lại mật khẩu. Vui lòng thử lại trong thời gian ngắn.' });
        return err;
      });
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .then(() => res.redirect('/forgot'))
    .catch(next);
};
exports.postUpdateRole = (req, res, next) => {

  console.log(req.body);
  User.findById(req.body.id, (err, user) => {
    if (err) { return next(err); }
    user.role = req.body.role;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Role ' + user.email + ' is ' + req.body.role });
      res.redirect('/pages/account');
    });
  });
};
exports.getEmailConfig = (req, res) => {
  ContactModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
    if (!data ) {
      data = new ContactModel();
    }
    if(!data.email){
      data.email= new EmailModel();
    }
    req.user.info = data.email;
    data = data.email;
    res.render('pages/Email', {
      title: 'Config Email', data
    });

  });

};
exports.postEmailConfig = (req, res) => {
  const email = new EmailModel({
    email: req.body.email,
    password: req.body.password,
  });
  const homeContactModel = new ContactModel({
    email: email
  }
  );
  process.env.SENDGRID_USER = req.body.email;
  process.env.SENDGRID_PASSWORD = req.body.password;
  ContactModel.findOne({}, (err, data) => {
    if (err) { return next(err); }
    if(data){
      data.email = email;
      data.save((err) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'Cập nhật thành công' });
        res.redirect('/pages/email');
      });
    }else{
      homeContactModel.save((err) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'Cập nhật thành công' });
        res.redirect('/pages/email');
      });
    }
    
   
  });
}; 