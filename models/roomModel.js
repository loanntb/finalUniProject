const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new mongoose.Schema({
  name: {type: String, index: true},
  floor: String,
  type:{ type: Schema.ObjectId, ref: 'typeroom' },
  convenient: String,
  description:String,
  area: String,
  amount_bed:String,
  occupancy:{ type: String, default: '1' },
  image: String,
  status:{ type: String, default: 'empty' }
});


const room = mongoose.model('room', roomSchema);

module.exports = room
