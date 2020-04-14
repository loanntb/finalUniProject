const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// https://stackoverflow.com/questions/14453864/use-more-than-one-schema-per-collection-on-mongodb
// Query normally and you get result of specific schema you are querying:
// mongoose.model('CoordinateModel').find({}).then((a)=>console.log(a));

const contactSchema = new mongoose.Schema({
  name:String,
  email: String,
  phone:String,
  msessage: String,
}, { _id: false });
const homecontactSchema = new mongoose.Schema({
  address:String,
  phone: String,
  description:String,
  email: String,
  openhour:String,
  image:String,
}, { _id: false });
const emailSchema = new mongoose.Schema({
  email:String,
  password: String,
}, { _id: false });
const EmailModel = mongoose.model('EmailModel', emailSchema);
const contactModel = mongoose.model('contactModel', contactSchema);
const HomecontactModel = mongoose.model('HomecontactSchema', homecontactSchema);
const ContactSchema = new mongoose.Schema({
contact:[contactSchema],
info:homecontactSchema,email:emailSchema},

  
 { collection: 'contact' });
const baseOptions = {
  discriminatorKey: '__type',
  collection: 'contact'
};

const Base = mongoose.model('contact', new mongoose.Schema({}, baseOptions));

const ContactModel = Base.discriminator("Contact",ContactSchema);

module.exports = {
  ContactModel,contactModel,HomecontactModel,EmailModel
};
