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

var port=process.env.PORT || 3000

const userModel=require('./models/user')
const detailsModel=require('./models/details')

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.email,
        pass: process.env.password
    }
});
var rand,mailOptions,host,link,verified=false;

app.post('/register',(req,res,next)=>{
    var post_data=req.query
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
                        res.json('Registered Successful')
                    }
                })
            }
        })
        

    })
})

app.post('/send',function(req,res){
    rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/verify?email="+req.query.mailto+"&id="+rand;
    var mailto=req.query.mailto
    verified=false
    mailOptions={
        to : mailto,
        subject : "Please confirm your Email account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
    }
    console.log(mailOptions)
    smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
            console.log(error)
        res.json("error")
    }else{
            console.log("Message sent: ");
        res.json("sent")
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
        userModel.findOne({email:req.query.email}).then((user)=>{
            if(user){
                user.verified=true
                console.log(user)
                user.save()
            }
        })
        console.log('updated')
        res.json("Email is been Successfully verified")
    }
    else
    {
        console.log("email is not verified")
        res.json("Bad Request - email not verified")
    }
    }
    else
    {
    res.json("Request is from unknown source")
    }
    })

app.post('/verifyemail',(req,res)=>{
    userModel.findOne({email:req.query.email}).then((user)=>{
        if(user.verified==true)
        {
            res.json("email is verified")
        }
        else{
            res.json("email not verified")
        }
    })
})

app.post('/login',(req,res)=>{
    var post_data=req.query
    var email=post_data.email
    var password=post_data.password

    userModel.findOne({email:email}).then((user)=>{
        if(!user){
            res.json({
                response:'User not found'
            })
        }
        else {
            bcryptjs.compare(password, user.password, function (err, result) {
                if (result == false) {
                    res.json({
                        response:'Invalid Password'
                    })
            
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

app.post('/addDetails',(req,res)=>{


    var data=req.query

    var obj={
        name:data.name,
        email:data.email,
        gender:data.gender,
        bio:data.bio,
        branch:data.branch,
        year:data.year,
        interests:data.interests
    }
    console.log(data.email)
    userModel.findOne({email:data.email}).then((result)=>{
        console.log(result)

        if(! result)
        {
            res.json("User not registered")
        }
        else{
            new detailsModel(obj).save((err,user)=>{
                if(err)
                {
                    res.json(err)
                }
                if(user)
                {
                    res.json("Details Added")
                }
            })
        }
    })
        
})

app.post('/updateDetails',(req,res)=>{

    var data=req.query
    var obj={
        name:data.name,
        email:data.email,
        gender:data.gender,
        bio:data.bio,
        branch:data.branch,
        year:data.year,
        interests:data.interests
    }

    detailsModel.findOneAndUpdate({email:data.email},{$set: obj},{new:true}).then((user1)=>{

        res.json('Details Updated')
        
    }).catch( (err)=>{
        res.json('failed to update')
    })
})

app.post('/showDetails',(req,res)=>{


    detailsModel.findOne({email:req.query.email}).then((user)=>{
    
            res.json({
                name:user.name,
                email:user.email,
                gender:user.gender,
                bio:user.bio,
                branch:user.branch,
                year:user.year,
                interests:user.interests

            })     
    }).catch((err)=>{
        
            res.json('Details cannot be found')

    })

    
})

app.listen(port,()=>{
    console.log('server running')
})
