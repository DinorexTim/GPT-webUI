const express=require("express");
var querystring=require("querystring");
var bodyParser=require('body-parser');
var session=require('express-session');
var http=require("http");
var mysql=require('mysql2');
const fs=require("fs");

// const { Configuration, OpenAIApi } = require('openai');
// const configuration = new Configuration({
//   organization: '',
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);
// openai.listEngines()
//   .then(response => {
//     console.log('Response:', response);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });

var app=express();
const ip="localhost";
const port=1111;
var body=[];
var User=new Map();
var orgid='';
var audiodata=[];
/*********************创建服务器**********************/
http.createServer((request,response)=>{
    response.writeHead(200,{'Content-Type':'text/plain'});
});
console.log(`Server is running at http://${ip}:${port}`);
/*********************创建session**********************/
app.use(session({
  secret:'gptweb1145141919810',
  cookie:{maxAge:20*60*1000},
  resave: false,
  saveUninitialized: false
}));
/********************MySQL数据库********************/
//配置本机mysql连接基本信息
let connectInfo = mysql.createConnection({
	host: 'localhost',
	port: '3306',
	user: 'root',
	password: 'WangHan@520',
	database: 'user'
})
//数据库建立连接
connectInfo.connect((err)=>{
  if(err){
    console.log('[query] - :'+err);
  }
  console.log("MySQL connection succeed!");
});
/********************处理请求********************/
app.use('/GPT_Web',express.static('GPT_Web'))
app.get('/', (req,res)=>{
    res.sendFile(__dirname+"/"+"/Index.html");
    if (req.session.sign) {//检查用户是否已经登录
      console.log(req.session);//打印session的值
      res.redirect("http://568a6702.r17.cpolar.top/Main.html");
    }else{
      req.session.sign = true;
      req.session.name = 'Client';
    }
    console.log("访问欢迎界面");
});
app.get('/Main.html', (req,res)=>{
    res.sendFile(__dirname+"/"+"/Main.html");
    console.log("访问主界面");
})
app.post('/process-login',(req,res)=>{
    req.on("data", (chunk) => {
      body.push(chunk);
    });
    req.on("end",()=>{
      body = Buffer.concat(body).toString();
      body = querystring.parse(body);
      User.set(body.orgid,body.APIkey);
      req.session.orgid=body.orgid;
      orgid=body.orgid;
      body=[];
      // res.redirect(`http://${ip}:${port}/Main.html`);
      res.redirect("http://568a6702.r17.cpolar.top/Main.html");
    })
});
//查询APIkey
app.get('/get-info',(req,res)=>{
  res.json({"orgid":orgid,"APIkey":User.get(orgid)});
  // sql=`select * from user where orgid="${orgid}"`;
  // console.log("获取APIkey...");
  // if(req.session.APIkey!=''){
  //   res.json({"orgid":req.session.orgid,"APIkey":req.session.APIkey});
  //   console.log("获取APIkey成功！");
  // }else{
  //   connectInfo.query(sql,(err,result,fields)=>{
  //     if(err){
  //       console.log('[SELECT ERROR] - ',err.message);
  //       console.log("获取APIkey失败！");
  //       return;
  //     }
  //     if(result.length!=0){
  //       console.log("获取APIkey成功！");
  //       res.json({"orgid":result[0].orgid,"APIkey":result[0].APIkey});
  //       return;
  //     }else{
  //       console.log("获取APIkey失败!");
  //     }
  //   });
  // }
})
app.get('/images/audiototext.png' , (req , res)=>{
  fs.readFile("./images/audiototext.png",(err,data)=>{
    if(err){
      console.log("加载图片失败！");
      throw err;
    }
    res.writeHead(200,{
      "Content-type":"image/png"
    });
    res.end(data);
  });
})
app.get('/images/texttoimage.png' , (req , res)=>{
  fs.readFile("./images/texttoimage.png",(err,data)=>{
    if(err){
      console.log("加载图片失败！");
      throw err;
    }
    res.writeHead(200,{
      "Content-type":"image/png"
    });
    res.end(data);
  });
})
app.get('/images/prompt.png' , (req , res)=>{
  fs.readFile("./images/prompt.png",(err,data)=>{
    if(err){
      console.log("加载图片失败！");
      throw err;
    }
    res.writeHead(200,{
      "Content-type":"image/png"
    });
    res.end(data);
  });
})
var server=app.listen(port,()=>{});
