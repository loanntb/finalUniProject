const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roombookSchema = new mongoose.Schema({
    _bookingId: Schema.Types.ObjectId,
    checkin: Date,
    checkout: Date,
    duration: Number,
    people: String,
    total_price: Number,
    phone:String,
    email:String,
    status: {type: String, default: 'ordered'},
    roomId: { type: Schema.ObjectId, ref: 'room' }
});

const book = mongoose.model('booking', roombookSchema);
module.exports = book
