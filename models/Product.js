let mongoose = require('mongoose')
let productSchema = new mongoose.Schema({
    product:String,
    visit:Array,
    timestamp: { type: String},
})

module.exports = mongoose.model('Product', productSchema)