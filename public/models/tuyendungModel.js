const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// https://stackoverflow.com/questions/14453864/use-more-than-one-schema-per-collection-on-mongodb
// Query normally and you get result of specific schema you are querying:
// mongoose.model('CoordinateModel').find({}).then((a)=>console.log(a));
const SlideSchema = new mongoose.Schema({
  title: String,
  sub_title: String,
  image_url: String,
}, { _id: false });
const infoSchema = new mongoose.Schema({
  description: String,
  update_at:String,
}, { _id: false });

const SlideModel = mongoose.model('SlideModel', SlideSchema);
const InfoModel = mongoose.model('InfoModel', infoSchema);

const PageSchema = new mongoose.Schema({
  slides: [SlideSchema],
  info:infoSchema,
  
}, { collection: 'tuyendung' });


const baseOptions = {
  discriminatorKey: '__type',
  collection: 'tuyendung'
};

const Base = mongoose.model('Tuyendung', new mongoose.Schema({}, baseOptions));

const PageModel = Base.discriminator('tuyendung',PageSchema);

module.exports = {
  SlideModel,
  PageModel,
  InfoModel,
};
