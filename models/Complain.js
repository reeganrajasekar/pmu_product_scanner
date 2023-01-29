let mongoose = require('mongoose')

let complainSchema = new mongoose.Schema({
    location:String,
    timestamp:String,
})

module.exports = mongoose.model('Complain', complainSchema)