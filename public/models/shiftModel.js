const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var shiftSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    salary: {
        type: Number
    },
    timeStart: {
        type: Number
    },
    timeEnd: {
        type: Number
    },
    coefficient: {
        type: Number
    }
}, {timestamps: true, collection: "shift"}
);
module.exports = mongoose.model('Shift', shiftSchema);