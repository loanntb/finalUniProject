const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// https://stackoverflow.com/questions/14453864/use-more-than-one-schema-per-collection-on-mongodb
// Query normally and you get result of specific schema you are querying:
// mongoose.model('CoordinateModel').find({}).then((a)=>console.log(a));

const menuSchema = new mongoose.Schema({
  name:String,
  description:String,
  price:String
}, { _id: false });
const homeBookTableSchema = new mongoose.Schema({
    date:String,
    name: String,
    time: String,
    phone:String,
    email:String,
    phone:String,
    people:String
  }, { _id: false });
const HomeBookModel = mongoose.model('HomeBookModel', homeBookTableSchema);
const MenuModel = mongoose.model('MenuModel', menuSchema);
const menuchema = new mongoose.Schema({
  drink:[menuSchema],
  food:[menuSchema],
  book:[homeBookTableSchema]
},{ collection: 'menu' });
const baseOptions = {
  discriminatorKey: '__type',
  collection: 'menu'
};

const Base = mongoose.model('menu', new mongoose.Schema({}, baseOptions));

const HomeMenuModel = Base.discriminator("Menu",menuchema);

module.exports = {
    MenuModel,
    HomeBookModel,
    HomeMenuModel,
};
