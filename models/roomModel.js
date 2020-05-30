const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');
// const Schema = mongoose.Schema;
// https://stackoverflow.com/questions/14453864/use-more-than-one-schema-per-collection-on-mongodb
// Query normally and you get result of specific schema you are querying:
// mongoose.model('CoordinateModel').find({}).then((a)=>console.log(a));

const roomSchema = new mongoose.Schema({
  _roomId: Schema.Types.ObjectId,
  name: {type: String, index: true},
  floor: String,
  type:String,
  convenient: String,
  description:String,
  area: String,
  amount_bed:String,
  occupancy:{ type: String, default: '1' },
  price: Number,
  image: String,
  status:{ type: String, default: 'empty' }
});
const roombookSchema = new mongoose.Schema({
  _bookingId: Schema.Types.ObjectId,
  checkin: Date,
  checkout: Date,
  duration: Number,
  people: String,
  total_price: Number,
  phone:String,
  email:String,
  identity_card:String,
  status: {type: String, default: 'ordered'},
  roomId: { type: Schema.ObjectId, ref: 'RoomModel' }
});

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
