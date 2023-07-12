# GPT_Web
- 一个可与GPT聊天的网页客户端
- 前往https://platform.openai.com/account/org-settings 获取你的组织ID
- 前往https://platform.openai.com/account/api-keys 获取你的APIkey
# 功能：
- [x] 实现单句问答
- [x] 实现联系上下文
- [ ] 支持markdown渲染
- [x] 用户输入apikey与组织id
- [x] 选择模型
- [x] 调节逆天程度 
- [x] 选择是否联系上下文
# 快速开始(nodejs)
- 下载以下模块
```
npm install express
npm install openai
npm install chatgpt
npm install querystring
npm install body-parser
```
- 将源代码下载至本地
```
git clone https://github.com/DINOREXNB/GPT_Web.git
```
- 进入工作区后，执行
```
node server.js
```