const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    product_name:{
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
    },
    product_description: {
        type: mongoose.SchemaTypes.String
    },
    product_price: {
        type: mongoose.SchemaTypes.Decimal128
    },
    product_tag: {
        type: [mongoose.SchemaTypes.String], 
        default: [], 
    },
    product_owner_id: {
        type: mongoose.SchemaTypes.String
    }
});

module.exports = mongoose.model('product', UserSchema);