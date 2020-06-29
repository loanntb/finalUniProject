const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  image: String
}, { _id: false });
const homebarSchema = new mongoose.Schema({
  address:String,
  phone: String,
  description:String,
}, { _id: false });


const imageModel = mongoose.model('imageModel', imageSchema);
const HomeBarModel = mongoose.model('HomeCafeModel', homebarSchema);
const BarSchema = new mongoose.Schema({
info:homebarSchema,
slides:[imageSchema]
},  
 { collection: 'cafe' });
const baseOptions = {
  discriminatorKey: '__type',
  collection: 'bar'
};

const Base = mongoose.model('bar', new mongoose.Schema({}, baseOptions));

const BarModel = Base.discriminator("Bar",BarSchema);

module.exports = {
  imageModel, HomeBarModel: HomeBarModel, BarModel: BarModel
};
