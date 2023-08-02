# GPT_Web
- 一个可与GPT聊天的网页客户端
- 需要APIkey才能使用！
- 前往https://platform.openai.com/account/org-settings 查看你的组织ID
- 前往https://platform.openai.com/account/api-keys 获取你的APIkey
# 功能：
- [x] 自选模型
- [x] 自定义逆天程度 
- [x] 单句回复/连续对话
- [x] 重新生成回复
- [x] 文字生成图片
- [x] 加载预设人格
- [x] 支持markdown渲染
- [ ] 重新编辑发送内容
- [ ] 历史对话存储
- [ ] ~~支持语音输入~~
# 快速开始
## NodeJS
- 下载以下模块
```
npm install express querystring body-parser
```
- 将源代码下载至本地
```
git clone https://github.com/DINOREXNB/GPT_Web.git
```
- 进入工作区后，执行
```
node server.js
```