const mongoose = require('mongoose'); 
var modifySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "booking"

    },
}, {timestamps: true, collection: "modify"}
);
module.exports = mongoose.model('modify', modifySchema);
