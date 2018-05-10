var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
mongoose.connect('mongodb://localhost:27017/nodeauth');

var db = mongoose.connection;


var UserSchema = mongoose.Schema({
    username:{
        type:String,
        index:true
    },
    password:{
        type:String
    },
    email:{
        type:String
    },
    name:{
        type:String
    },
    profileImage:{
        type:String
    }
});


var User = module.exports = mongoose.model('User',UserSchema);

module.exports.getUserById = (id,callback)=>{
    User.findById(id,callback);
}

module.exports.getUserByUsername = (username,callback)=>{
    var query = {username:username};
    User.findOne(query,callback);
}

module.exports.comparePassword = (candidatePassword,hash,callback)=>{
    bcrypt.compare(candidatePassword, hash, function(err,isMatch) {
       callback(null,isMatch);
    });
}

module.exports.createUser = (newUser,callback)=>{
    console.log('parola inainte'+ newUser.password);
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            console.log('parola dupa'+ newUser.password);
            newUser.save(callback);
        });
    });
  
};