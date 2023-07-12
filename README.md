# GPT_Web
- 一个可与GPT聊天的网页客户端
- 需要APIkey才能使用！
- 前往https://platform.openai.com/account/org-settings 查看你的组织ID
- 前往https://platform.openai.com/account/api-keys 获取你的APIkey
# 功能：
- [x] 自选模型
- [x] 自定义逆天程度 
- [x] 单句回复/连续对话
- [ ] 支持markdown渲染
- [x] 重新生成回复
- [ ] 重新编辑发送内容
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