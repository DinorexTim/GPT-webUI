const express = require('express');
const router = express.Router();
const fs=require("fs");
router.get('/chat', (req,res)=>{
    res.sendFile(__dirname+'/public/chat.html');
});
router.get('/settings', (req,res)=>{
    res.sendFile(__dirname+'/public/settings.html');
});
router.get('/css/:filename',(req,res)=>{
    const filename=req.params.filename;
    fs.readFile(__dirname+`/css/${filename}`,(err,data)=>{
        if(err){
            console.log(`Fail to load ${filename}!`);
        }
        res.writeHead(200,{
            "Content-type":"text/css"
        });
        res.end(data)
    });
});
router.get('/js/:filename',(req,res)=>{
    const filename=req.params.filename;
    fs.readFile(__dirname+`/js/${filename}`,(err,data)=>{
        if(err){
            console.log(`Fail to load ${filename}!`);
        }
        res.writeHead(200,{
            "Content-type":"text/javascript"
        });
        res.end(data);
    });
});
router.get('/images/:filename',(req,res)=>{
    const filename=req.params.filename;
    fs.readFile(__dirname+`/images/${filename}`,(err,data)=>{
        if(err){
            console.log(`Fail to load ${filename}!`);
        }
        res.writeHead(200,{
            "Content-type":"image/ico"
        });
        res.end(data);
    });
});

module.exports = router;