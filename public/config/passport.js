const passport = require('passport');
const request = require('request');
const {Strategy: LocalStrategy} = require('passport-local');
const {Strategy: FacebookStrategy} = require('passport-facebook');
const {OAuth2Strategy: GoogleStrategy} = require('passport-google-oauth');
const {Strategy: OpenIDStrategy} = require('passport-openid');
const {OAuthStrategy} = require('passport-oauth');
const {OAuth2Strategy} = require('passport-oauth');
const _ = require('lodash');

const User = require('../models/userModel');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
  User.findOne({email: email.toLowerCase()}, (err, user) => {
    if (err) {return done(err);}
    if (!user) {
      return done(null, false, {msg: `Email ${email} not found.`});
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) {return done(err);}
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, {msg: 'Invalid email or password.'});
    });
  });
}));

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */


/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
  // clientID: process.env.FACEBOOK_ID,
  // clientSecret: process.env.FACEBOOK_SECRET,
  //callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
  clientID: "190072958817429",
  clientSecret: "77c33dc128505bcb2a0140e9a30fb95c",
  callbackURL: `http://localhost:8080/auth/facebook/callback`,
  profileFields: ['name', 'email', 'link', 'locale', 'timezone', 'gender'],
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    User.findOne({facebook: profile.id}, (err, existingUser) => {
      if (err) {return done(err);}
      if (existingUser) {
        req.flash('errors', {msg: 'Đã có một tài khoản Facebook thuộc về bạn. Đăng nhập bằng tài khoản đó hoặc xóa nó, sau đó liên kết nó với tài khoản hiện tại của bạn.'});
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {
          if (err) {return done(err);}
          user.facebook = profile.id;
          user.tokens.push({kind: 'facebook', accessToken});
          user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
          user.save((err) => {
            req.flash('info', {msg: 'Tài khoản Facebook đã được liên kết.'});
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({facebook: profile.id}, (err, existingUser) => {
      if (err) {return done(err);}
      if (existingUser) {
        return done(null, existingUser);
      }
      User.findOne({email: profile._json.email}, (err, existingEmailUser) => {
        if (err) {return done(err);}
        if (existingEmailUser) {
          req.flash('errors', {msg: 'Đã có một tài khoản sử dụng địa chỉ email này. Đăng nhập vào tài khoản đó và liên kết nó với Facebook theo cách thủ công từ Cài đặt tài khoản.'});
          done(err);
        } else {
          const user = new User();
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({kind: 'facebook', accessToken});
          user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
          user.profile.gender = profile._json.gender;
          user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
}));

/**
 * Sign in with Google.
 */
passport.use(new GoogleStrategy({
  clientID: "692028526236-navp6jp8b4nkffa1dm0e4u7l8l4r7l9i.apps.googleusercontent.com",
  clientSecret: "0DDuw28NUjr7g1zc8MuS_bbY",
  callbackURL: 'http://localhost:8080/auth/google/callback',
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    User.findOne({google: profile.id}, (err, existingUser) => {
      if (err) {return done(err);}
      if (existingUser) {
        req.flash('errors', {msg: 'Đã có một tài khoản Google thuộc về bạn. Đăng nhập bằng tài khoản đó hoặc xóa nó, sau đó liên kết nó với tài khoản hiện tại của bạn.'});
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {
          if (err) {return done(err);}
          user.google = profile.id;
          user.tokens.push({kind: 'google', accessToken});
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || profile._json.image.url;
          user.save((err) => {
            req.flash('info', {msg: 'Tài khoản Google đã được liên kết.'});
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({google: profile.id}, (err, existingUser) => {
      if (err) {return done(err);}
      if (existingUser) {
        return done(null, existingUser);
      }
      User.findOne({email: profile.emails[0].value}, (err, existingEmailUser) => {
        if (err) {return done(err);}
        if (existingEmailUser) {
          req.flash('errors', {msg: 'Đã có một tài khoản sử dụng địa chỉ email này. Đăng nhập vào tài khoản đó và liên kết nó với Google theo cách thủ công từ Cài đặt tài khoản.'});
          done(err);
        } else {
          const user = new User();
          user.email = profile.emails[0].value;
          user.google = profile.id;
          user.tokens.push({kind: 'google', accessToken});
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = profile._json.image.url;
          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];
  const token = req.user.tokens.find(token => token.kind === provider);
  if (token) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
