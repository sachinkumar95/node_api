const jwt = require('jsonwebtoken');
const USER_COLLECTION = require('../models/user.model');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
const crypto = require("crypto");
// var transporter = nodemailer.createTransport(smtpTransport({
//     service: 'gmail',
//     auth: {
//         user: 'abcd@yopmail.com',
//         pass: '12345'
//     }
// }));


/*
TYPE: POST
DETAILS: Login user with email and password
*/
exports.login = (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    console.log(req.body)
    if (email == "undefined" || email == null || email == "") {
        return res.json({ status: "error", message: "Email address is required!" });
    } else if (password == "undefined" || password == null || password == "") {
        return res.json({ status: "error", message: "Password is required!" });
    } else  {
        let condition = {
            email: req.body.email,
        }
        var user =  USER_COLLECTION.findOne(condition).then(Userdetaill=> {
            if(Userdetaill){
                bcrypt.compare(req.body.password, Userdetaill.password, function (err, isMatch) {
                    if (err) return cb(err);
                   if(isMatch){
                         var userDetails = {
                            email:  Userdetaill.email,
                            name: Userdetaill.firstName,
                            id: Userdetaill._id,
                        }
                        var token = jwt.sign(userDetails, "someSecretKey", {
                            expiresIn: 2592000
                        });
                        return res.send({ status:"success", message: "Login success!", data: userDetails, token: 'Basic ' + token });
                   }else{
                    return res.send({ status:"error", message: "Email/Password incorrect!"});
                   }
                })
            }else{
                return res.send({ status:"error", message: "No record found"});
            }
        });
    }
}


/*
TYPE: POST
DETAILS: To create new User
*/
exports.createUser = (req, res) => {
    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password ) {
        res.send({ status: "error", message: "data insufficient" });
    }
    if (req.body.email == "undefined" || req.body.email == null || req.body.email == "") {
        return res.json({ status: "error", message: "Email address is required!" });
    } else if (req.body.password == "undefined" || req.body.password == null || req.body.password == "") {
        return res.json({ status: "error", message: "Password is required!" });
    }
    else {
        let password;
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) return err;
            bcrypt.hash(req.body.password, salt, function (err, hash) {
                if (err) return next(err);
                password = hash;
                USER_COLLECTION.findOne({ email: req.body.email, isDeleted: false })
                .then(user => {
                    if (user) {
                        res.send({ status: "error", message: "user already exists" });
                    } else {
                        const UserObj = {
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            address: req.body.address,
                            password: password,
                        };
                        USER_COLLECTION.create(UserObj, function (err, user) {
                            if (err)
                                res.send({ status: "error", message: "Fail to create new User!", err: err });
                            else {
                                res.send({ status: "success", message: "User created" });
                            }
                        });
                     
                    }
                })
            })
        });
       
    }
}


/*
TYPE: put
TODO: API to update User by Id
*/
exports.update = (req, res) => {
    console.log("body", req.body);
    if (!req.params.Id) {
        return res.send({
            status: "error",
            message: "User data not found with id "
        });
    } else {
        if (!req.body.firstName || !req.body.lastName || !req.body.address ) {
            res.json({ status:"error", message:"Required fields missing" });
        } else {
            USER_COLLECTION.findById(req.params.Id, function (err, result) {
                if (err || !result) {
                    res.send({ status: "fail", message: 'Invalid user' });
                }
                else {
                    const userObj = {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        address: req.body.address,
                    };
                    USER_COLLECTION.findByIdAndUpdate(req.params.Id, { $set: userObj }, { new: false }, function (err, result) {
                        if (err) {
                            res.send({ status: "error", message: err });
                        }
                        res.send({ status: "success", message: "User data is Updated Successfully!", data: result });
                    });
                }
            });
        }
    }
}


/*
TYPE: delete
TODO: API to delete user by Id
*/
exports.delete = (req, res) => {
    if (!req.params.Id) {
        return res.send({
            status: "error",
            message: "User not found with id " + req.params.Id
        });
    }
    else {
        console.log("hewe",req.params.Id)
        USER_COLLECTION.findByIdAndUpdate(req.params.Id, { $set: { isDeleted: true } }, { new: false }, function (err, result) {
            if (err) {
                res.send({ status: "error", message: err });
            }
            if(result){
                res.send({ status: "success", message: "User deleted successfully!" });
            }
        });
    }
};


/*
TYPE: POST
DETAILS: To send email for reset password
*/

exports.forgetPassword = (req, res) => {
    if (!req.body.email) {
        return res.send({
            message: "Email required"
        });
    } else {
        USER_COLLECTION.findOne({ email: req.body.email })
            .then(user => {
                if (!user) { res.json({ status:"error", message: "User not exists with this email!" }); }
                else {
                    var token = crypto.randomBytes(16).toString('hex');
                    var resetLink = "localhost/" + token;
                    var name = user.firstName;
                    var email = user.email;
                    var UserData = {
                        resetKey: token,
                        resetPasswordExpires: Date.now() + 3600000, // 1 hour
                    }
                    USER_COLLECTION.findByIdAndUpdate({
                        _id: user._id
                    }, {
                        $set: UserData
                    }, async function (err, userData) {
                        if (err) {
                            res.send({
                                code: "error",
                                message:"User Not exists"
                            })
                        } else {
                            var mailOptions = {
                                to: "abc@xyz.com",
                                from: "abcd@xyz.com",
                                subject: 'Password Reset Link',
                                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                                    resetLink + '\n\n' +
                                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                            }
                            // transporter.sendMail(mailOptions, (err, info) => {
                            //     res.send({ status: "success", message: "Reset pasword link sent to your email!" });
                            // });
                            res.send({ status: "success", message: "Reset pasword link sent to your email!" });
                        }
                    });
    }
})
    }
}


/*
TYPE: POST
DETAILS: To reset password by email link
*/
exports.resetPassword = (req,res) =>{
    var resetKey_value = req.body.resetKey;
    let condition =
        { resetKey: resetKey_value };

    USER_COLLECTION.findOne(condition).then(user =>{
        if (user) {
            let password;
            bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
                if (err) return err;
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    if (err) return next(err);
                    password = hash;
                    USER_COLLECTION.findByIdAndUpdate(user._id, { $set: { password: password,resetKey:'' } }, { new: false }, function (err, result) {
                        if(result){
                            res.send({
                                status:'success',
                                message: 'Password Changed',
                            });
                        }
                    })
                })
            })
          
        } else {
             res.send({
                code: 400,
                status:'error',
                message: 'Reset password token expires! Regenerate token to set password',
            });
        }
    });
  
}