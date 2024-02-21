const sqlite3 = require('sqlite3');
const data = new sqlite3.Database('data.db');
data.run('CREATE TABLE IF NOT EXISTS chat (chatid TEXT, content TEXT, PRIMARY KEY(chatid,content))');
data.run('CREATE TABLE IF NOT EXISTS settings (temperature FLOAT, frequency_penalty FLOAT, presence_penalty FLOAT, max_tokens INTAGER, PRIMARY KEY(temperature))');
data.run('CREATE TABLE IF NOT EXISTS prompts (title TEXT, content TEXT, PRIMARY KEY(title))');
data.run('INSERT INTO settings (temperature ,frequency_penalty ,presence_penalty ,max_tokens) VALUES (1,0,0,1024)');