const mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    image: {
        type: String,

    },
    description: {
        type: String
    }

}, {timestamps: true, collection: "category"});

module.exports = mongoose.model('category', categorySchema);