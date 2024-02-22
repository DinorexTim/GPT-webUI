const express=require("express");
const http=require("http");
const sqlite=require('sqlite3');
const fs=require("fs");
const yaml = require('js-yaml');
const axios=require('axios');
const router = require('./router');

const url_chat="https://api.openai.com/v1/chat/completions";
var settings={

};
var chatid="";
var model="gpt-3.5-turbo";
/********************read settings.yaml********************/
var settings;
try {
    const yamlContent = fs.readFileSync('./setting/settings.yaml', 'utf8');
    settings = yaml.load(yamlContent);
    console.log(settings);
} catch (error) {
    console.error('Error reading or parsing YAML file:', error);
}
const port=settings.port;
const apikey=settings.apikey
/*********************web server**********************/
var app=express();
server=http.createServer((request,response)=>{
    response.writeHead(200,{'Content-Type':'text/plain'});
});
console.log(`Server is running at http://localhost:${port}`);
var server=app.listen(port,()=>{});
/********************sqlite********************/
const dbPath=__dirname+'/data/data.db';
let db=new sqlite.Database(dbPath,(err)=>{
    if(err){
        console.error('Error connecting to the database: ',err.message);
    }
    console.log("connection succeed");
    let select_sql = `SELECT * FROM settings`;
    db.all(select_sql, function(err,rows) {
        if (err) {
            return console.error(err.message);
        }
        settings=rows[0];
        console.log(settings);
    });
    db.close();
});
/********************Load static resources***************************/
app.use('/',router);
/*********************Process request**********************/
app.post('/saveSettings',(req,res)=>{
    var body="";
    req.on('data',(chunk)=>{
        body+=chunk.toString();
    });
    req.on('end',()=>{
        let preference=JSON.parse(body);
        console.log(preference);
        let db=new sqlite.Database(dbPath,(err)=>{
            if(err){
                console.error('Error connecting to the database: ',err.message);
            }
            console.log("connection succeed");
            let update_sql = `UPDATE settings 
            SET temperature = ?,
            frequency_penalty = ?,
            presence_penalty = ?,
            max_tokens = ?;`
            let data = [preference.temperature,preference.frequency_penalty,preference.presence_penalty,preference.max_tokens];
            db.run(update_sql, data, function(err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`Row(s) updated: ${this.changes}`);
            });
            db.close();
        });
        res.json({"status":200});
    })
});
app.post('/getPreference',(req,res)=>{
    let db=new sqlite.Database(dbPath,(err)=>{
        if(err){
            console.error('Error connecting to the database: ',err.message);
        }
        console.log("connection succeed");
        let select_sql = `SELECT * FROM settings`;
        db.all(select_sql, function(err,rows) {
            if (err) {
                return console.error(err.message);
            }
            console.log(rows);
            settings=rows[0];
            res.json(rows[0]);
        });
        db.close();
    });
});
app.post('/selectModel',(req,res)=>{
    var body="";
    req.on('data',(chunk)=>{
        body+=chunk.toString();
    });
    req.on('end',()=>{
        body=JSON.parse(body);
        console.log(body);
        model=body.model;
        res.json({});
    });
});
app.post('/chat',(req,res)=>{
    var body="";
    req.on('data',(chunk)=>{
        body+=chunk.toString();
    });
    req.on('end',()=>{
        body=JSON.parse(body);
        console.log(body);
        const data={
            "model": model,
            "messages": body.messages,
            "temperature":settings.temperature,
            "frequency_penalty":settings.frequency_penalty,
            "presence_penalty":settings.presence_penalty,
            "max_tokens":settings.max_tokens
        }
        axios.post(url_chat,data,{
            headers:{
                'Content-Type': "application/json",
                'Authorization': `Bearer `+`${apikey}`
            }
        }).then((response)=>{
            console.log(response.data);
            res.json({
                "messages":response.data.choices[0].message.content
            });
            // update content
            let db=new sqlite.Database(dbPath,(err)=>{
                if(err){
                    console.error('Error connecting to the database: ',err.message);
                }
                console.log("connection succeed");
                let update_sql = `UPDATE chat
                SET content = ?
                WHERE chatid = ?`;
                body.messages.push(response.data.choices[0].message);
                console.log("待存对话:",body.messages);
                let data = [JSON.stringify(body.messages), chatid];
                db.run(update_sql, data, function(err) {
                    if (err) {
                        return console.error(err.message);
                    }
                    console.log(`Row(s) updated: ${this.changes}`);
                });
                db.close();
            });
        }).catch((error)=>{
            console.error("Error",error.message);
            res.json({
                "messages":error.message
            });
        });
    })
});
app.post('/newChat',(req,res)=>{
    var body="";
    req.on('data',(chunk)=>{
        body+=chunk.toString();
    });
    req.on('end',()=>{
        body=JSON.parse(body);
        console.log(body);
        let db=new sqlite.Database(dbPath,(err)=>{
            if(err){
                console.error('Error connecting to the database: ',err.message);
            }
            let data=[body.chatid,`[{"role":"system","content":""}]`]
            chatid=body.chatid;
            let insert_sql=`INSERT INTO chat (chatid,content) VALUES (?,?)`;
            db.run(insert_sql, data, function(err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`A row has been inserted with rowid ${this.lastID}`);
                res.json({});
            });
            db.close()
        })
    });
});
app.post('/deleteChat',(req,res)=>{
    var body="";
    req.on('data',(chunk)=>{
        body+=chunk.toString();
    });
    req.on('end',()=>{
        body=JSON.parse(body);
        console.log(body);
        let db=new sqlite.Database(dbPath,(err)=>{
            if(err){
                console.error('Error connecting to the database: ',err.message);
            }
            console.log("connection succeed");
            let delete_sql = `DELETE FROM chat WHERE chatid = ?;`
            let data = [body.chatid];
            db.run(delete_sql, data, function(err) {
                if (err) {
                    return console.error(err.message);
                }
                chatid="";
                console.log(`Row(s) deleted: ${this.changes}`);
            });
            db.close();
        });
    });
});
app.post('/getSidebar',(req,res)=>{
    let db=new sqlite.Database(dbPath,(err)=>{
        if(err){
            console.error('Error connecting to the database: ',err.message);
        }
        console.log("connection succeed");
        let select_sql = `SELECT chatid FROM chat`;
        db.all(select_sql, function(err,rows) {
            if (err) {
                return console.error(err.message);
            }
            res.json({
                "rows":rows
            });
        });
        db.close();
    });
});
app.post('/loadDialogue',(req,res)=>{
    var body="";
    req.on('data',(chunk)=>{
        body+=chunk.toString();
    });
    req.on('end',()=>{
        body=JSON.parse(body);
        console.log(body);
        chatid=body.chatid;
        let db=new sqlite.Database(dbPath,(err)=>{
            if(err){
                console.error('Error connecting to the database: ',err.message);
            }
            console.log("connection succeed");
            let select_sql = `SELECT content FROM chat WHERE chatid = ?`;
            let data=[body.chatid];
            db.all(select_sql, data, function(err,rows) {
                if (err) {
                    return console.error(err.message);
                }
                if(rows.length==0){
                    res.json({
                        "content":""
                    });
                }else{
                    res.json({
                        "content":rows[0].content
                    });
                }
            });
            db.close();
        });
    });
});
app.post('/getPrompts',(req,res)=>{
    let db=new sqlite.Database(dbPath,(err)=>{
        if(err){
            console.error('Error connecting to the database: ',err.message);
        }
        console.log("connection succeed");
        let select_sql = `SELECT * FROM prompts`;
        db.all(select_sql, function(err,rows) {
            if (err) {
                return console.error(err.message);
            }
            console.log(rows);
            res.json({
                "content":rows
            });
        });
        db.close();
    });
});
app.post('/newPrompt',(req,res)=>{
    var body="";
    req.on('data',(chunk)=>{
        body+=chunk.toString();
    });
    req.on('end',()=>{
        body=JSON.parse(body);
        console.log(body);
        let db=new sqlite.Database(dbPath,(err)=>{
            if(err){
                console.error('Error connecting to the database: ',err.message);
            }
            console.log("connection succeed");
            let select_sql = `SELECT * FROM prompts WHERE title = ?`;
            let data=[body.title]
            db.all(select_sql, data ,function(err,rows) {
                if (err) {
                    return console.error(err.message);
                }
                if (rows.length==0){
                    let update_sql = `INSERT INTO 
                    prompts (title,content)
                    VALUES (?,?);`
                    let data = [body.title,body.content];
                    db.run(update_sql, data, function(err) {
                        if (err) {
                            return console.error(err.message);
                        }
                        console.log(`Row(s) updated: ${this.changes}`);
                    });
                }else{
                    let update_sql = `UPDATE prompts 
                    SET content = ?
                    WHERE title = ?;`
                    let data = [body.content,body.title];
                    db.run(update_sql, data, function(err) {
                        if (err) {
                            return console.error(err.message);
                        }
                        console.log(`Row(s) updated: ${this.changes}`);
                    });
                }
            });
            db.close();
        });
    });
});
app.post('/updatePrompt',(req,res)=>{
    var body="";
    req.on('data',(chunk)=>{
        body+=chunk.toString();
    });
    req.on('end',()=>{
        body=JSON.parse(body);
        console.log(body);
        let db=new sqlite.Database(dbPath,(err)=>{
            if(err){
                console.error('Error connecting to the database: ',err.message);
            }
            console.log("connection succeed");
            let update_sql = `UPDATE prompts 
            SET content = ?
            WHERE title = ?;`
            let data = [body.content,body.title];
            db.run(update_sql, data, function(err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`Row(s) updated: ${this.changes}`);
            });
            db.close();
        });
    });
});
app.post('/deletePrompt',(req,res)=>{
    var body="";
    req.on('data',(chunk)=>{
        body+=chunk.toString();
    });
    req.on('end',()=>{
        body=JSON.parse(body);
        console.log(body);
        let db=new sqlite.Database(dbPath,(err)=>{
            if(err){
                console.error('Error connecting to the database: ',err.message);
            }
            console.log("connection succeed");
            let delete_sql = `DELETE FROM prompts WHERE title = ?;`
            let data = [body.title];
            db.run(delete_sql, data, function(err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`Row(s) deleted: ${this.changes}`);
            });
            db.close();
        });
    });
});