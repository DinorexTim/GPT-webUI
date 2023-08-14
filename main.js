const mainbox=document.getElementById('mainbox');
const btn=document.getElementById("submit");
const interaction=document.getElementById("interaction");
const MODEL1=document.getElementById("model1");
const MODEL2=document.getElementById("model2");
const MODEL3=document.getElementById("model3");
const Contextlinkage=document.getElementById("Context-linkage")
const Temperature=document.getElementById("temperature");
const setprompt=document.getElementById("prompt");
const audiototext=document.getElementById("audiototext");
const texttoimage=document.getElementById("texttoimage");
const SIZE1=document.getElementById("size1");
const SIZE2=document.getElementById("size2");
const SIZE3=document.getElementById("size3");
const NUMofIMAGES=document.getElementById("images-range");
const selectedOption = document.getElementById('selectedOption');
const conversationOptions = document.getElementById('conversationOptions');

var query="";
var model="gpt-3.5-turbo";
var isContextLinkage=1;
var temperature=5;
var historical_dialogue=[];
var replyID=0;
var spinner_cnt=0;
var max_dialogue_record=14;
var size="256x256";
var numofimages=1;
var formaudio = new FormData();
var orgid='';
var dialogue_id=0;
var isclick=0;
var isclicknewchat=0;
var isSummary=0;

//选择模型***********************************
MODEL1.addEventListener('input',()=>{
    model="gpt-4";
    console.log("model: "+model);
})
MODEL2.addEventListener('input',()=>{
    model="gpt-3.5-turbo";
    console.log("model: "+model);
})
MODEL3.addEventListener('input',()=>{
    model="gpt-3.5-turbo-0613";
    console.log("model: "+model);
})

//选择图像大小***********************************
SIZE1.addEventListener("click",()=>{
    size="256x256";
    console.log("image size:256x256");
});
SIZE2.addEventListener("click",()=>{
    size="512x512";
    console.log("image size:512x512");
});
SIZE3.addEventListener("click",()=>{
    size="1024x1024";
    console.log("image size:1024x1024");
});

//TODO:利用session加载偏好设置***********************************   







//选择图像数量***********************************
NUMofIMAGES.addEventListener("input",()=>{
    numofimages=NUMofIMAGES.value;
    document.getElementById("numofimages").innerHTML=`<h2 style="height: 45px;">Num of images:${numofimages}</h2></h2>`;
});

//选择是否联系上下文***********************************
Contextlinkage.addEventListener('input',()=>{
    isContextLinkage=1-isContextLinkage;
    console.log("Context Linkage:"+isContextLinkage);
})

//选择逆天程度***********************************
Temperature.addEventListener('input',()=>{
    temperature=document.getElementById("temperature-range").value;
    document.getElementById("value").innerHTML=`<h2 style="height: 50px;">Temperature:${temperature/10}</h2>`;
})

//添加预设人格***********************************
setprompt.addEventListener('click',()=>{
    console.log('预设人格...');
    var orgid="";
    var APIkey="";
    async function getAPIkey() {
        try {
            const response = await fetch('get-info');
            const data = await response.json();
            return data.APIkey;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async function apikey() {
    APIkey = await getAPIkey();
    }
    async function sendRequest(){
    if(document.getElementById("query").value!=''){
        console.log("已发送请求...");    
        query=document.getElementById("query").value;
        document.getElementById("query").value='';
        console.log("query: "+query);
        if(replyID!=0){
            document.getElementById(`regenerate${replyID-1}`).innerHTML='';
        }
        interaction.innerHTML=interaction.innerHTML+`
            <div id="spinner${spinner_cnt}">
            <div class="spinner"></div>
            </div>
        `;
        //添加用户历史对话
        historical_dialogue=historical_dialogue.concat([{"role":"user","content":query}]);
        if(historical_dialogue.length>max_dialogue_record){
            historical_dialogue.shift();
        }
        console.log("历史对话:");
        console.log(JSON.stringify(historical_dialogue));
        //发送请求
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.openai.com/v1/chat/completions');
        await apikey();
        xhr.setRequestHeader('Authorization', 'Bearer '+APIkey);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                let Response=JSON.parse(xhr.responseText);
                console.log(xhr.responseText);
                document.getElementById(`spinner${spinner_cnt}`).innerHTML='';
                interaction.innerHTML=interaction.innerHTML+`
                    <div class="content" id="replyprompt">
                    <h3>PUA:</h3>
                    <div class="ReplyContent">
                    <p id="promptsuccess"></p>
                    </div>
                    </div>
                `;
                var text=`人格加载成功！`;
                var index=0;
                var textElement = document.getElementById(`promptsuccess`);
                function showText() {
                    if (index < text.length) {
                        textElement.innerHTML += text.charAt(index);
                        interaction.scrollTop=interaction.scrollHeight;
                        index++;
                        setTimeout(showText, 20); 
                    }else{
                        //存储对话
                        saveDialogue();
                    }
                }
                showText();
                //添加GPT历史对话
                historical_dialogue=historical_dialogue.concat([{"role":"assistant","content":Response.choices[0].message.content}]);
                if(historical_dialogue.length>max_dialogue_record){
                    historical_dialogue.shift();
                }
                //存储对话
                saveDialogue();
                console.log(historical_reply);
            }else{
                document.getElementById(`spinner${spinner_cnt}`).innerHTML='';
                interaction.innerHTML=interaction.innerHTML+`
                    <div class="content">
                    <h3>PUA:</h3>
                    <div class="ReplyContent">
                    <p>❌请求失败，状态码：${xhr.status}</p>
                    </div>
                    </div>
                `;
                console.error('请求失败，状态码：' + xhr.status + '，错误信息：' + xhr.statusText);
            }
            spinner_cnt++;
        };
        if(isContextLinkage){
            const data = {
                "model": model,
                "messages": historical_dialogue,
                "temperature": temperature/10,
            };
            console.log(data);
            xhr.send(JSON.stringify(data));
            }else{
            const data = {
                "model": model,
                "messages": [{"role":"user","content":query}],
                "temperature": temperature/10,
            };
            console.log(data);
            xhr.send(JSON.stringify(data));
        }
    }
    }
    sendRequest();
});

//语音转文字(bug)***********************************
audiototext.addEventListener('click',()=>{
    query=document.getElementById("query").value;
    document.getElementById("query").value='';
    console.log("query: "+query);
    console.log("选择音频文件...");
    const input = document.createElement('input');
    input.type = 'file';
    input.accept="audio/*"
    // 当用户选择文件时触发
    input.addEventListener('change', () => {
    // 获取用户选择的文件
    const file = input.files[0];
    const reader=new FileReader();
    if(replyID){
        document.getElementById(`regenerate${replyID-1}`).innerHTML='';
    }
    reader.addEventListener('load',()=>{
        //上传文件
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.openai.com/v1/audio/transcriptions');
        xhr.setRequestHeader('Authorization', 'Bearer '+APIkey);
        xhr.setRequestHeader('Content-Type', 'multipart/form-data');
        xhr.onload = function() {
        if (xhr.status === 200) {
            let Response=JSON.parse(xhr.responseText);
            console.log(Response);
            //增添回复
            interaction.innerHTML=interaction.innerHTML+`
            <div class="content">
            <h3>PUA:</h3>
            <div class="ReplyContent">
            <p>${Response.text}</p>
            </div>
            </div>
            `;
            interaction.scrollTop=interaction.scrollHeight;
        }else{
            interaction.innerHTML=interaction.innerHTML+`
            <div class="content">
            <h3>PUA:</h3>
            <div class="ReplyContent">
            <p>❌请求失败，状态码：${xhr.status}</p>
            </div>
            </div>
            `;
            interaction.scrollTop=interaction.scrollHeight;
            console.error('请求失败，状态码：' + xhr.status + '，错误信息：' + xhr.statusText);
        }
        };
        // 创建一个Formdata对象，并将文件添加到其中
        formaudio.append("file", file);
        formaudio.append("model", 'whisper-1');
        formaudio.append("prompt",query);
        //打印
        console.log(file);
        formaudio.forEach((value, key) => {
        console.log(`${key}: ${value}`);
        });
        xhr.send(formaudio);
    });
    // 开始读取文件
    reader.readAsBinaryString(file);
    });
    input.click();
});

//文字生成图片***********************************
texttoimage.addEventListener('click',()=>{
    var orgid="";
    var APIkey="";
    async function getAPIkey() {
    try {
        const response = await fetch('get-info');
        const data = await response.json();
        return data.APIkey;
    } catch (error) {
        console.log(error);
        return null;
    }
    }
    async function apikey() {
    APIkey = await getAPIkey();
    }
    async function sendRequest(){
        if(document.getElementById("query").value!=''){
            console.log("已发送请求..."); 
            interaction.innerHTML=interaction.innerHTML+`
                <div class="content">
                <h3>You:</h3>
                <div class="ReplyContent">
                <p>${document.getElementById("query").value}</p>
                </div>
                </div>
                <div id="spinner${spinner_cnt}">
                <div class="spinner"></div>
                </div>
            `;
            interaction.scrollTop=interaction.scrollHeight;
            query=document.getElementById("query").value;
            document.getElementById("query").value='';
            console.log("query: "+query);
            if(replyID){
                document.getElementById(`regenerate${replyID-1}`).innerHTML='';
            }
            //发送请求
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://api.openai.com/v1/images/generations');
            await apikey();
            xhr.setRequestHeader('Authorization', 'Bearer '+APIkey);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    let Response=JSON.parse(xhr.responseText);
                    console.log(Response);
                    //增添回复
                    document.getElementById(`spinner${spinner_cnt}`).innerHTML='';
                    interaction.innerHTML=interaction.innerHTML+`
                        <div class="content">
                            <h3>PUA:</h3>
                        </div>
                    `;
                    for(var cnt=0;cnt<numofimages;cnt++){
                        interaction.innerHTML=interaction.innerHTML+`
                            <div class="content">
                                <img src='${Response.data[cnt].url}' alt=''>
                            </div>
                        `;
                        interaction.scrollTop=interaction.scrollHeight;
                    }
                }else{
                    document.getElementById(`spinner${spinner_cnt}`).innerHTML='';
                    interaction.innerHTML=interaction.innerHTML+`
                        <div class="content">
                        <h3>PUA:</h3>
                        <div class="ReplyContent">
                        <p>❌请求失败，状态码：${xhr.status}</p>
                        </div>
                        </div>
                    `;
                    interaction.scrollTop=interaction.scrollHeight;
                    console.error('请求失败，状态码：' + xhr.status + '，错误信息：' + xhr.statusText);
                }
                spinner_cnt++;
            };
            const data = {
                "prompt": query,
                "n":parseInt(numofimages),
                "size":size,
            };
            console.log(data);
            xhr.send(JSON.stringify(data));
        }
    }
    sendRequest();
});

//重新生成回复***********************************
function resendrequest(){      
    console.log("Regenerating...");
    var orgid="";
    var APIkey="";
    async function getAPIkey() {
        try {
            const response = await fetch('get-info');
            const data = await response.json();
            return data.APIkey;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async function apikey() {
        APIkey = await getAPIkey();
    }
    async function sendRequest(){
    historical_dialogue.pop();
    if(replyID){
        document.getElementById(`reply${replyID-1}`).innerHTML='';
    }
    interaction.innerHTML=interaction.innerHTML+`
        <div id="spinner${spinner_cnt}">
        <div class="spinner"></div>
        </div>
    `;
    console.log("已发送请求...");
    console.log("query: "+query);
    console.log("历史对话:");
    console.log(JSON.stringify(historical_dialogue));
    //发送请求
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.openai.com/v1/chat/completions');
    await apikey();
    xhr.setRequestHeader('Authorization', 'Bearer '+APIkey);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            let Response=JSON.parse(xhr.responseText);
            console.log(Response);
            //添加GPT历史对话
            historical_dialogue=historical_dialogue.concat([{"role":"assistant","content":Response.choices[0].message.content}]);
            if(historical_dialogue.length>max_dialogue_record){
                historical_dialogue.shift();
            }
            //增添回复
            var htmltext=marked(Response.choices[0].message.content);
            document.getElementById(`spinner${spinner_cnt}`).innerHTML='';
            interaction.innerHTML=interaction.innerHTML+`
            <div class="content" id="reply${replyID}">
                <h3>PUA:</h3>
                <div class="ReplyContent" id="ReplyContent${replyID}">
                
                </div>
                <button id="${replyID}" onclick="copyContent(this.id)">Copy</button>
                <div id="regenerate${replyID}">
                <button id="regeneratebtn${replyID}">Regenerate</button>
                </div>
            </div>
            `;
            var index = 0;
            var temp='';
            var textElement = document.getElementById(`ReplyContent${replyID}`);
            function showText() {
                if (index < htmltext.length) {
                    temp+=htmltext.charAt(index);
                    if(htmltext.charAt(index)!='<'&&htmltext.charAt!='>'&&htmltext.charAt(index)!='/'){
                        textElement.innerHTML=`${temp}`;
                    }
                    interaction.scrollTop=interaction.scrollHeight;
                    index++;
                    setTimeout(showText, 20);
                }else{
                    //存储对话
                    saveDialogue();
                }
            }
            showText();
            document.getElementById(`regeneratebtn${replyID}`).addEventListener('click',resendrequest);
            replyID++;
        }else{
            var text=`❌请求失败，状态码：${xhr.status}`;
            document.getElementById(`spinner${spinner_cnt}`).innerHTML='';
            interaction.innerHTML=interaction.innerHTML+`
                <div class="content" id=reply${replyID}>
                    <h3>PUA:</h3>
                    <div class="ReplyContent" id="ReplyContent${replyID}">
                    <p id='texterror${replyID}'></p>
                    </div>
                    <div id="regenerate${replyID}">
                    <button id="regeneratebtn${replyID}">Regenerate</button>
                    </div>
                </div>
            `;
            var index = 0;
            var textElement = document.getElementById(`texterror${replyID}`);
            function showText() {
                if (index < text.length) {
                    textElement.innerHTML += text.charAt(index);
                    interaction.scrollTop=interaction.scrollHeight;
                    index++;
                    setTimeout(showText, 20); 
                }
            }
            showText();
            document.getElementById(`regeneratebtn${replyID}`).addEventListener('click',resendrequest);
            replyID++;
            console.error('请求失败，状态码：' + xhr.status + '，错误信息：' + xhr.statusText);
        }
        spinner_cnt++;
    };
    if(isContextLinkage){
        const data = {
            "model": model,
            "messages": historical_dialogue,
            "temperature": temperature/10,
        };
        console.log(data);
        xhr.send(JSON.stringify(data));
        }else{
            const data = {
                "model": model,
                "messages": [{"role":"user","content":query}],
                "temperature": temperature/10,
            };
            console.log(data);
            xhr.send(JSON.stringify(data));
        }
    }
    sendRequest();
}

//生成回复***********************************
function sendrequest(){
    var orgid="";
    var APIkey="";
    async function getAPIkey() {
        try {
            const response = await fetch('get-info');
            const data = await response.json();
            return data.APIkey;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async function apikey() {
        APIkey = await getAPIkey();
    }
    async function sendRequest(){
        if(document.getElementById("query").value!=''){
            console.log("已发送请求..."); 
            //若没有点击new chat并且对话为空自动创建对话
            if((!isclicknewchat)&&(interaction.innerHTML=='')){
                await getDialogueID();
                historical_dialogue=[];    
                historical_reply=[];
                replyID=0;
                spinner_cnt=0;
                const newLiElement = document.createElement('li');//创建新的一行对话
                newLiElement.classList.add('select-option');
                newLiElement.setAttribute('data-value',`${dialogue_id}`);
                newLiElement.textContent = `对话${dialogue_id}`;
                conversationOptions.appendChild(newLiElement);
                selectedOption.textContent=newLiElement.textContent;
                conversationOptions.classList.remove('active');
                isclicknewchat=1;
            }
            interaction.innerHTML=interaction.innerHTML+`
                <div class="content">
                <h3>You:</h3>
                <div class="ReplyContent">
                <p>${document.getElementById("query").value}</p>
                </div>
                </div>
                <div id="spinner${spinner_cnt}">
                <div class="spinner"></div>
                </div>
            `;
            interaction.scrollTop=interaction.scrollHeight;
            query=document.getElementById("query").value;
            document.getElementById("query").value='';
            console.log("query: "+query);
            if(replyID!=0){
                var errortext="";
                try{
                    document.getElementById(`regenerate${replyID-1}`).innerHTML='';
                }catch(error){
                    errortext=error
                    console.log(errortext);
                }
                if(errortext==""){
                    document.getElementById(`regenerate${replyID-1}`).innerHTML='';
                }
            }
            //添加用户历史对话
            historical_dialogue=historical_dialogue.concat([{"role":"user","content":query}]);
            if(historical_dialogue.length>max_dialogue_record){
                historical_dialogue.shift();
            }
            console.log("历史对话:");
            console.log(JSON.stringify(historical_dialogue));
            //发送请求
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://api.openai.com/v1/chat/completions');
            await apikey();
            xhr.setRequestHeader('Authorization', 'Bearer '+APIkey);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    let Response=JSON.parse(xhr.responseText);
                    console.log(Response);
                    //添加GPT历史对话
                    historical_dialogue=historical_dialogue.concat([{"role":"assistant","content":Response.choices[0].message.content}]);
                    if(historical_dialogue.length>max_dialogue_record){
                        historical_dialogue.shift();
                    }
                    //增添回复
                    var htmltext=marked(Response.choices[0].message.content);
                    document.getElementById(`spinner${spinner_cnt}`).innerHTML='';
                    interaction.innerHTML=interaction.innerHTML+`
                    <div class="content" id="reply${replyID}">
                    <h3>PUA:</h3>
                    <div class="ReplyContent" id="ReplyContent${replyID}">
                    
                    </div>
                    <button id="${replyID}" onclick="copyContent(this.id)">Copy</button>
                    <div id="regenerate${replyID}">
                        <button id="regeneratebtn${replyID}">Regenerate</button>
                    </div>
                    </div>
                    `;
                    var index = 0;
                    var temp='';
                    var textElement = document.getElementById(`ReplyContent${replyID}`);
                    function showText() {
                        if (index < htmltext.length) {
                            temp+=htmltext.charAt(index);
                            if(htmltext.charAt(index)!='<'&&htmltext.charAt!='>'&&htmltext.charAt(index)!='/'){
                                textElement.innerHTML=`${temp}`;
                            }
                            interaction.scrollTop=interaction.scrollHeight;
                            index++;
                            setTimeout(showText, 20);
                        }else{
                            //存储对话
                            saveDialogue();
                        }
                    }
                    showText();
                    document.getElementById(`regeneratebtn${replyID}`).addEventListener('click',resendrequest);
                    replyID++;
                }else{
                    var text=`❌请求失败，状态码：${xhr.status}`;
                    document.getElementById(`spinner${spinner_cnt}`).innerHTML='';
                    interaction.innerHTML=interaction.innerHTML+`
                        <div class="content" id=reply${replyID}>
                        <h3>PUA:</h3>
                        <div class="ReplyContent" id="ReplyContent${replyID}">
                        <p id='texterror${replyID}'></p>
                        </div>
                        <div id="regenerate${replyID}">
                            <button id="regeneratebtn${replyID}">Regenerate</button>
                        </div>
                        </div>
                    `;
                    var index = 0;
                    var textElement = document.getElementById(`texterror${replyID}`);
                    function showText() {
                    if (index < text.length) {
                        textElement.innerHTML += text.charAt(index);
                        interaction.scrollTop=interaction.scrollHeight;
                        index++;
                        setTimeout(showText, 20); 
                    }
                    }
                    showText();
                    document.getElementById(`regeneratebtn${replyID}`).addEventListener('click',resendrequest);
                    replyID++;
                    console.error('请求失败，状态码：' + xhr.status + '，错误信息：' + xhr.statusText);
                }
                spinner_cnt++;
            };
            if(isContextLinkage){
            const data = {
                "model": model,
                "messages": historical_dialogue,
                "temperature": temperature/10,
            };
            console.log(data);
            xhr.send(JSON.stringify(data));
            }else{
                const data = {
                    "model": model,
                    "messages": [{"role":"user","content":query}],
                    "temperature": temperature/10,
                };
                console.log(data);
                xhr.send(JSON.stringify(data));
            }
        }
    }
    sendRequest();
}

//使用回车发送内容生成回复***********************************
function sendrequestKey(){
    if(event.code=='Enter'){
        sendrequest();
    }
}

//发送聊天请求***********************************
btn.addEventListener("click",sendrequest);

//回车发送内容***********************************
document.addEventListener("keydown",sendrequestKey);

//复制对话内容***********************************
function copyContent(id){
    var content_text=document.getElementById(`ReplyContent${id}`).innerText;
    var textarea=document.createElement("textarea");
    textarea.value=content_text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

//返回登录界面***********************************
document.getElementById('back').addEventListener('click',()=>{
    if(confirm("确认返回登录界面？")){
        fetch("/delete-session",{
            method:'GET'
        })
        .then(response=>{
            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Request error:', error);
        });
        window.location.href="/"
    }
});

//将历史对话发送给服务器***********************************
function saveDialogue(){
    //大于200字符时总结对话主题
    var APIkey="";
    async function getAPIkey() {
        try {
            const response = await fetch('get-info');
            const data = await response.json();
            return data.APIkey;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async function apikey() {
        APIkey = await getAPIkey();
    }
    async function sendRequest(){
        await apikey();
        if(interaction.innerText.length>200&&(!isSummary)){
            historical_dialogue.push({"role":"user","content":"请用一句话总结刚才的对话，字数不超过十个字"});
            async function summaryDialogue(){
                try{
                    const response = await fetch("https://api.openai.com/v1/chat/completions",{
                        method:'POST',
                        headers:{
                            'Content-Type':'application/json',
                            'Authorization':'Bearer '+APIkey,
                        },
                        body:JSON.stringify({
                            "model": model,
                            "messages": historical_dialogue,
                            "temperature": temperature/10,
                        })
                    })
                    const data=await response.json();
                    var title=data.choices[0].message.content;
                    const lielement=conversationOptions.querySelector(`li[data-value="${dialogue_id}"]`);
                    selectedOption.textContent=title;
                    lielement.innerText=title;
                    historical_dialogue.pop();
                    isSummary=1;
                }catch(error){
                    console.error('Request error:', error);
                }
            }
            summaryDialogue();
        }
    }
    sendRequest();
    //DialogueID***************************
    async function fetchDialogueID(){
        fetch("/getDialogueID",{
            method:'POST',
            body:dialogue_id,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Request error:', error);
        });
    }
    //replyID***************************
    async function fetchreplyID(){
        fetch("/getreplyID",{
            method:'POST',
            body:replyID,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Request error:', error);
        });
    }
    //spinner_cnt***************************
    async function fetchspinner_cnt(){
        fetch("/getspinner_cnt",{
            method:'POST',
            body:spinner_cnt,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Request error:', error);
        });
    }
    //对话HTML***************************
    async function fetchDialogueHTML(){
        fetch("/getDialogueHTML",{
            method:'POST',
            body:JSON.stringify(interaction.innerHTML),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Request error:', error);
        });
    }
    //orgid***************************
    async function fetchorgID(){
        fetch("/getorgid",{
            method:'POST',
            body:orgid,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Request error:', error);
        });
    }
    //保存对话
    async function SaveDialogue(){
        await fetchDialogueID();
        await fetchreplyID();
        await fetchspinner_cnt();
        await fetchDialogueHTML();
        await fetchorgID();
        fetch("/saveDialogue",{
            method:'POST',
            body:JSON.stringify(historical_dialogue),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }else{
                console.log("保存对话成功！");
            }
        })
        .catch(error => {
            console.error('Request error:', error);
        });
    }
    SaveDialogue();
}

//加载历史对话***********************************
async function loadDialogue(selectedIndex,orgid){
    dialogue_id=selectedIndex;
    fetch("/getorgid",{
        method:'POST',
        body:orgid,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Request failed with status: ${response.status}`);
        }
    })
    .catch(error => {
        console.error('Request error:', error);
    });
    try {
        const response = await fetch('loadDialogue',{
            method:'POST',
            body:selectedIndex,
        });
        const data = await response.json();
        console.log("待加载对话:");
        console.log(data);
        //加载replyID,spinner_cnt
        replyID=data.replyID;
        spinner_cnt=data.spinner_cnt;
        interaction.innerHTML=data.dialogueHTML;
        historical_dialogue=JSON.parse(data.dialogue);
        isSummary=0;
        document.getElementById(`regeneratebtn${replyID-1}`).addEventListener('click',resendrequest);
    } catch (error) {
        console.log(error);
        return null;
    }
}

//显示历史对话***********************************
selectedOption.addEventListener('mouseover', function() {
    conversationOptions.classList.toggle('active');
    isclick=1;
});

//隐藏历史对话***********************************
mainbox.addEventListener('mouseleave',()=>{
    conversationOptions.classList.remove('active');
});

//加载或创建新对话***********************************
conversationOptions.addEventListener('click', async function(event) {
    if (event.target.classList.contains('select-option')) {
        const selectedIndex = event.target.getAttribute('data-value');
        if (selectedIndex >= 0) {
            selectedOption.textContent = event.target.textContent;
            conversationOptions.classList.remove('active');
            // 加载对话
            loadDialogue(selectedIndex,orgid);
        }
        //创建新对话
        if(selectedIndex==-1&&interaction.innerHTML.length>5){
            await getDialogueID();
            historical_dialogue=[];    
            historical_reply=[];
            replyID=0;
            spinner_cnt=0;
            isSummary=0;
            interaction.innerHTML='';
            document.getElementById("query").value='';
            const newLiElement = document.createElement('li');//创建新的一行对话
            newLiElement.classList.add('select-option');
            newLiElement.setAttribute('data-value',`${dialogue_id}`);
            newLiElement.textContent = `对话${dialogue_id}`;
            selectedOption.textContent = newLiElement.textContent;
            conversationOptions.appendChild(newLiElement);
            conversationOptions.classList.remove('active');
        }
    }
});

//获取orgid(用户名)***********************************
async function getorgID(){
    try {
        const response = await fetch('get-info');
        const data = await response.json();
        orgid=data.orgid;
    } catch (error) {
        console.log(error);
        return null;
    }
}

//获取历史对话ID最大值***********************************
async function getDialogueID(){
    try {
        const response = await fetch('sendDialogueID',{
            method:'POST',
            body:orgid,
        });
        const data = await response.json();
        console.log(data);
        dialogue_id=data.id+1;
    } catch (error) {
        console.log(error);
        return null;
    }
}

getorgID();
interaction.innerHTML='';