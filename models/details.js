var mongoose = require('mongoose')
var validator = require('validator')

var users = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate(user) {
            if (!validator.isEmail(user)) {
                throw new Error('invalid email')
            }
        }
    },
    branch:{
        type:String
    },
    gender:{
        type:String
    },
    bio: {
        type: String
    },
    year:
    {
        type:String
    },
    interests:
    {
        type:String
    }

})

var detailsModel = mongoose.model('detailsModel', users)

module.exports = detailsModel