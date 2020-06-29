/* eslint-disable object-curly-spacing */
const mongoose = require('mongoose');


const roomSchema = new mongoose.Schema({
  name: {type: String, index: true},
  floor: String,
  convenient: String,
  description: String,
  size: Number,
  people: {
    type: Number, default: 1
  },
  bed: Number,
  image: String,
  status: {
    type: Boolean, default: false
  },
  price: {type: Number},
  view: {type: String},
  type: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category"
    }

}, {timestamps: true, collection: "room"});
const room = mongoose.model('room', roomSchema);

module.exports = room;
