const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// https://stackoverflow.com/questions/14453864/use-more-than-one-schema-per-collection-on-mongodb
// Query normally and you get result of specific schema you are querying:
// mongoose.model('CoordinateModel').find({}).then((a)=>console.log(a));

const imageSchema = new mongoose.Schema({
  image: String
}, { _id: false });
const homecafeSchema = new mongoose.Schema({
  address:String,
  phone: String,
  description:String,
}, { _id: false });


const imageModel = mongoose.model('imageModel', imageSchema);
const HomeCafeModel = mongoose.model('HomeCafeModel', homecafeSchema);
const CafeSchema = new mongoose.Schema({
info:homecafeSchema,
slides:[imageSchema]
},  
 { collection: 'cafe' });
const baseOptions = {
  discriminatorKey: '__type',
  collection: 'cafe'
};

const Base = mongoose.model('cafe', new mongoose.Schema({}, baseOptions));

const CafeModel = Base.discriminator("Cafe",CafeSchema);

module.exports = {
  imageModel,HomeCafeModel,CafeModel
};
