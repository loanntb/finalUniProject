const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// https://stackoverflow.com/questions/14453864/use-more-than-one-schema-per-collection-on-mongodb
// Query normally and you get result of specific schema you are querying:
// mongoose.model('CoordinateModel').find({}).then((a)=>console.log(a));
const homeWelcomeSchema = new mongoose.Schema({
  description: String,
  welcome_url: String,
  image_url:String,
}, { _id: false });
const homeIntroSchema = new mongoose.Schema({
  service:String,
  description: String,
  url: String,
  image:String,
}, { _id: false });

const HomeWelcomeModel = mongoose.model('HomeWelcomeModel', homeWelcomeSchema);
const HomeIntroModel = mongoose.model('HomeIntroModel', homeIntroSchema);
const homePageSchema = new mongoose.Schema({
  welcome:homeWelcomeSchema,
  intro:[homeIntroSchema],
}, { collection: 'pages' });


const baseOptions = {
  discriminatorKey: '__type',
  collection: 'pages'
};

const Base = mongoose.model('Page', new mongoose.Schema({}, baseOptions));

const HomePageModel = Base.discriminator('HomePage', homePageSchema);

module.exports = {
  HomePageModel,
  HomeWelcomeModel,
  HomeIntroModel
};
