const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const typeRoomSchema = new mongoose.Schema({
  type:String,
  price: Number,
  image: String,
});


const typeroom = mongoose.model('typeroom', typeRoomSchema);

module.exports = typeroom
