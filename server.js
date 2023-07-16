const express=require("express");
var querystring=require("querystring");
var bodyParser=require('body-parser');
var http=require("http");
const fs=require("fs");

const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  organization: 'org-arJ1x5TbRFipySTbj2c7oWOQ',
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
openai.listEngines()
  .then(response => {
    console.log('Response:', response);
  })
  .catch(error => {
    console.error('Error:', error);
  });

var app=express();
const ip="localhost";
const port=1111;
/*********************创建服务器**********************/
http.createServer((request,response)=>{
    response.writeHead(200,{'Content-Type':'text/plain'});
});
console.log(`Server is running at http://${ip}:${port}`);
app.use('/GPT_Web',express.static('GPT_Web'))
app.get('/', (req,res)=>{
    res.sendFile(__dirname+"/"+"/Index.html");
    console.log("访问欢迎界面");
})
app.get('/Main.html', (req,res)=>{
    res.sendFile(__dirname+"/"+"/Main.html");
    console.log("访问主界面");
})
var body=[];
var APIkey;
var orgid;
app.post('/process-login',(req,res)=>{
    req.on("data", (chunk) => {
      body.push(chunk);
    });
    req.on("end",()=>{
      body = Buffer.concat(body).toString();
      body = querystring.parse(body);
      APIkey=body.APIkey;
      orgid=body.orgid;      
      body=[];
      res.redirect(`http://${ip}:${port}/Main.html`);
    })
});
app.get('/get-info',(req,res)=>{
  res.json({"orgid":orgid,"APIkey":APIkey});
})
app.get('/images/audiototext.png' , (req , res)=>{
  fs.readFile("./images/audiototext.png",(err,data)=>{
    if(err){
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
      throw err;
    }
    res.writeHead(200,{
      "Content-type":"image/png"
    });
    res.end(data);
  });
})
var server=app.listen(port,()=>{});