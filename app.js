const express=require('express')
const bodyParser=require('body-parser')
const bcryptjs=require('bcryptjs')
var nodemailer = require("nodemailer");
var app=express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

require('dotenv').config()
var db = require('./config/keys')
var mongoose = require('mongoose')
mongoose.connect(db.mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

var port=3000 || process.env.PORT

const userModel=require('./models/user')

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "ffds.new@gmail.com",
        pass: "ffds_codechefvit"
    }
});
var rand,mailOptions,host,link,verified=false;

app.post('/register',(req,res,next)=>{
    var post_data=req.body
    var plainPass=post_data.password
    var username=post_data.name
    var email=post_data.email
    var gender=post_data.gender
    bcryptjs.hash(plainPass, 10, function (err, hash){
        var newobj={
            name:username,
            email,
            gender,
            password:hash
        }
        userModel.findOne({email:email}).then((user)=>{
            if(user)
            {
                res.json('User already exists')
            }
            else{
                new userModel(newobj).save((err,user)=>{
                    if(err)
                    {
                        res.json(err)
                    }
                    if(user)
                    {
                        res.json('Registered Successfully')
                    }
                })
            }
        })
        

    })
})

app.post('/send',function(req,res){
    rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/verify?id="+rand;
    var mailto=req.body.too
    verified=false
    mailOptions={
        to : mailto,
        subject : "Please confirm your Email account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
            console.log(error);
        res.json("error");
    }else{
            console.log("Message sent: ");
        res.json("sent");
        }
    });
    });

app.get('/verify',function(req,res){
    console.log(req.protocol+":/"+req.get('host'));
    if((req.protocol+"://"+req.get('host'))==("http://"+host))
    {
    console.log("Domain is matched. Information is from Authentic email");
    console.log(rand)
    if(req.query.id==rand)
    {
        console.log("email is verified");
        verified=true
        
        res.json("Email  is been Successfully verified");
    }
    else
    {
        console.log("email is not verified");
        res.json("Bad Request");
    }
    }
    else
    {
    res.json("Request is from unknown source");
    }
    });

    app.post('/verify',(req,res)=>{
    if(verified==true)
    {
        res.json("email is verified")
    }
    else{
        res.json("not verified")
    }
})

app.post('/login',(req,res)=>{
    var post_data=req.body
    var email=post_data.email
    var password=post_data.password

    userModel.findOne({email:email}).then((user)=>{
        if(!user){
            res.json('Email not found')
        }
        else {
            bcryptjs.compare(password, user.password, function (err, result) {
                if (result == false) {
                    res.json('Invalid Password')
            
                } else {
                    res.json({
                        response:'Login successful',
                        name:user.name,
                        email
                    })
                }
            })
        }
    })
})

app.listen(port,()=>{
    console.log('server running')
})
