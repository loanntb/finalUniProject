const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roombookSchema = new mongoose.Schema({
    _bookingId: Schema.Types.ObjectId,
    checkin: Date,
    checkout: Date,
    duration: Number,
    people: Number,
    total_price: Number,
    phone: String,
    email: String,
    identity_card: String,
    is_available: {type: Boolean, default: true},
    roomId: {type: Schema.ObjectId, ref: 'room'}
});

const book = mongoose.model('booking', roombookSchema);
module.exports = book
