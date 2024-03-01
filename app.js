const express = require("express")
const app = express();
app.use(express.static('public'));
const cors = require("cors")

var mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://pmu:trysomething@cluster0.pg1pug1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true ,useUnifiedTopology: true,});
const Product = require("./models/Product");
const Complain = require("./models/Complain");

var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(cors())

var bodyParser = require('body-parser')
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');

app.get("/",(req,res)=>{
    res.render("app.ejs")
})

app.get("/admin",(req,res)=>{
    res.render("index.ejs",{query : ""})
})

app.post("/",(req,res)=>{
    if(req.body.email=="admin@gmail.com" && req.body.password=="admin"){
        res.cookie('admin',"kjmhbcd78sybo87y3ql8bulou")
        res.redirect("/home")
    }else{
        res.render("index.ejs",{query : "Username or Password is wrong"})
    }
})

app.get("/home",async (req,res)=>{
    if(req.cookies["admin"]=="kjmhbcd78sybo87y3ql8bulou"){
        var product = await Product.find().sort({"timestamp":-1});
        var dates = await Product.find().distinct('product');
        var complain = await Complain.find();
        var c_dates = await Complain.find().distinct('timestamp');
        res.render("home.ejs",{product:product,dates:dates,complain:complain,c_dates:c_dates})
    }else{
        res.render("index.ejs",{query : "Bad request!"})
    }
})
app.get("/qrcode",async (req,res)=>{
    if(req.cookies["admin"]=="kjmhbcd78sybo87y3ql8bulou"){
        var products = await Product.find().sort({"timestamp":-1});
        var dates = await Product.find().distinct('timestamp');
        var list = await Product.find().distinct('product');
        res.render("qrcode.ejs",{products:products,dates:dates,list:list})
    }else{
        res.render("index.ejs",{query : "Bad request!"})
    }
})
app.post("/create",async (req,res)=>{
    if(req.cookies["admin"]=="kjmhbcd78sybo87y3ql8bulou"){
        for(let i=0;i<req.body.n;i++){
            var product = await Product({
                product:req.body.product,
                timestamp:req.body.timestamp,
                visit:[],
            });
            j=0;
            product.save((err)=>{
                if(err){j=1;}
            });
            if(j==1){
                res.redirect("/qrcode?err=Something went wrong!");
                break;
            }
        }
        res.redirect("/print?limit="+req.body.n)
    }else{
        res.render("index.ejs",{query : "Bad request!"})
    }
})
app.get("/print" ,async (req,res)=>{
    if(req.cookies["admin"]=="kjmhbcd78sybo87y3ql8bulou"){
        var products = await Product.find().sort({"timestamp":-1}).limit(req.query.limit);
        res.render("print.ejs",{products:products})
    }else{
        res.render("index.ejs",{query : "Bad request!"})
    }
})
app.get("/logout" , (req,res)=>{
    res.cookie('auth','')
    res.redirect("/")
})

app.get("/api" ,async (req,res)=>{
    if(req.query.id && req.query.id.length==24){
        var products = await Product.findById(String(req.query.id));
        if(products && products.visit.length<5){
            var data = products.visit;
            var dt = new Date();
            date_ = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
            data.push(date_)
            var chane = await Product.findByIdAndUpdate(String(req.query.id),{visit:data});
            res.sendStatus(200);
        }else{
            res.sendStatus(404);
        }
    }else{
        res.sendStatus(404);
    }
})

app.get("/api/com" ,async (req,res)=>{
  		var d = (new Date().getUTCMonth()+1) +"/"+new Date().getUTCDate()+"/"+new Date().getUTCFullYear();
      var complain = await Complain({
          location:req.query.data,
        	timestamp:d
      });
      complain.save();
  	res.sendStatus(200);
})

app.listen(4000,'0.0.0.0',(err)=>{
    if(err){
        console.log(err);
    }else{
        console.log("Server Started");
    }
})
