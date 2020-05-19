const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = require('mongodb').ObjectID;
// const Schema = mongoose.Schema;
// https://stackoverflow.com/questions/14453864/use-more-than-one-schema-per-collection-on-mongodb
// Query normally and you get result of specific schema you are querying:
// mongoose.model('CoordinateModel').find({}).then((a)=>console.log(a));

const roomSchema = new mongoose.Schema({
  _id: ObjectId,
  name: {type: String, index: true},
  floor: String,
  type:String,
  convenient: String,
  description:String,
  area: String,
  amount_bed:String,
  price: String,
  image:String,
}, { _id: true });
const roombookSchema = new mongoose.Schema({
  _bookingId: ObjectId,
  checkin:String,
  checkout: String,
  room_type:String,
  people: String,
  phone:String,
  email:String,
  identity_card:String,
  roomID: {type: Schema.ObjectId, ref: "roomModel"}
}, { _bookingId: true });

const RoomModel = mongoose.model('roomModel', roomSchema);
const RoomBookModel = mongoose.model('RoomBookModel', roombookSchema);
const roomchema = new mongoose.Schema({
  room:[roomSchema],
  book:[roombookSchema]},
  
 { collection: 'room' });
const baseOptions = {
  discriminatorKey: '__type',
  collection: 'room'
};

const Base = mongoose.model('room', new mongoose.Schema({}, baseOptions));

const HomeRoomModel = Base.discriminator("Room",roomchema);

module.exports = {
    HomeRoomModel,
    RoomModel,
    RoomBookModel
};
