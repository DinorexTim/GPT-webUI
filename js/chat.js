const send=document.getElementById('send');
const toggle_sidebar=document.getElementById('sidebar-toggle');
const settings=document.getElementById('settings');
const usage=document.getElementById('usage');
const query=document.getElementById('query');
const newchat=document.getElementById('new-chat');
const interaction=document.getElementById('interaction');
const historychat=document.getElementById('historychat');
const prompts=document.getElementById('prompts');

const send_image=document.getElementById('send-image');

const down=document.getElementById('down');
const guide=`<h1 style="margin-top: 60px;text-align: center;position: absolute;left: 50%;transform: translate(-50%, -50%);">Your own AI assistant</h1>`

var cansend=1;
var messages=[{"role":"system",content:""}]
const length_chatid=10;
query.addEventListener('input',()=>{
    localStorage.setItem("query",query.value)
})
send.addEventListener('click',()=>{
    var text="";
    if(cansend&&query.value!=""){
        if(interaction.innerHTML==guide){
            interaction.innerHTML='';
            document.getElementById('new-chat').click();
            toggle_sidebar.innerHTML = `<i class="fa fa-angle-double-right"></i>`;
            sidebar.style.left =  "-150px";
            interaction.innerHTML='';
        }
        text=query.value;
        localStorage.removeItem("query");
        query.value="";
        // cansend=1-cansend;
        interaction.innerHTML+=`<div class="dlg"><h2>You</h2><div class="text">${convertNewlinesAndSpacesToHTML(text)}</div><div class="spinner"></div>`;
        interaction.scrollTop=interaction.scrollHeight;
        messages.push({"role": "user","content": text})
        fetch('/chat',{
            method:'POST',
            body:JSON.stringify({
                "messages":messages
            })
        })
        .then((response=>response.json()))
        .then((data)=>{
            messages.push({"role": "assistant","content": data.messages})
            document.querySelector('.spinner').remove();
            interaction.innerHTML+=`<div class="dlg"><h2>Assistant</h2><div class="text">${marked(data.messages)}</div>`;
            interaction.scrollTop=interaction.scrollHeight;
            document.querySelectorAll('.copy-code-btn').forEach(element=>{
                element.remove();
            })
            document.querySelectorAll('pre').forEach(function(preElement) {
                createCopyButton(preElement);
            });
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    }
});
function addNewChat(){
    if(interaction.innerHTML!=guide){
        messages=[{"role":"system","content":""}];
        toggle_sidebar.click();
        fetch('/getPrompts',{
            method:'POST'
        })
        .then((response=>response.json()))
        .then((data)=>{
            interaction.innerHTML=`
            <div style="display:flex;justify-content:space-around"><h2>Choose a prompt to start 🎭</h2></div>
            <div class="prompts" style="padding-bottom:0px">
                <h3 class="prompt_name" contenteditable="false">Start directly⚡</h3>
                <div class="prompt_content" contenteditable="false" style="display:none"></div>
            </div>`;
            for(let index=0;index<data.content.length;index++){
                interaction.innerHTML+=`<div class="prompts">
                <h3 class="prompt_name" contenteditable="false">${data.content[index].title}</h3>
                <div class="prompt_content" contenteditable="false">${convertNewlinesAndSpacesToHTML(data.content[index].content)}</div>
            </div>`;  
            }
            interaction.scrollTop=0;
            document.querySelectorAll('.prompts').forEach(element=>{
                element.addEventListener('click',()=>{
                    messages[0].content=element.querySelector(".prompt_content").innerText;
                    interaction.innerHTML="";
                    var a=document.createElement('button');
                    a.className="btn";
                    a.addEventListener('contextmenu',()=>{
                        event.preventDefault();
                        const deleteBtn = document.getElementById('deleteBtn');
                        deleteBtn.style.display = 'block';
                        deleteBtn.style.left = event.clientX + 'px';
                        deleteBtn.style.top = event.clientY + 'px';

                        deleteBtn.onclick = function() {
                            interaction.innerHTML=guide;
                            document.getElementById(`${data.rows[index].chatid}`).remove();
                            fetch('/deleteChat',{
                                method:'POST',
                                body:JSON.stringify({
                                    "chatid":data.rows[index].chatid
                                })
                            })
                            deleteBtn.style.display = 'none';
                            localStorage.setItem("chatid","");
                            window.location.reload();
                        }
                    })
                    a.textContent=generateRandomString(length_chatid);
                    document.getElementById('new-chat').parentNode.insertBefore(a,document.getElementById('new-chat').nextElementSibling);
                    fetch('/newChat',{
                        method:'POST',
                        headers:{
                            'Content-Type': 'application/json'
                        },
                        body:JSON.stringify({
                            "chatid":a.textContent
                        })
                    });
                });
            })
        });
    }
}
newchat.addEventListener('click',addNewChat);
document.querySelector('.dropbtn').addEventListener('click',()=>{
    if(document.getElementById('modelOptions').style.opacity=="1"){
        document.getElementById('modelOptions').style.opacity="0";
    }else{
        document.getElementById('modelOptions').style.opacity="1";
    }
});
document.addEventListener('click', function(event) {
    var dropdownContent = document.querySelector('.dropdown-content');
    var topbarContent=document.querySelector(".topbar");
    if (!(dropdownContent.contains(event.target)||topbarContent.contains(event.target))) {
      dropdownContent.style.opacity = '0';
    }
});
function selectModel(model) {
    document.querySelector('.dropbtn').textContent = model;
    document.getElementById('modelOptions').style.opacity = '0';
    fetch('/selectModel',{
        method:'POST',
        body:JSON.stringify({
            "model": model.toLowerCase()
        })
    })
}
prompts.addEventListener('click',()=>{
    toggle_sidebar.click();
    fetch('/getPrompts',{
        method:'POST'
    })
    .then((response=>response.json()))
    .then((data)=>{
        interaction.innerHTML='';
        for(let index=0;index<data.content.length;index++){
            interaction.innerHTML+=`<div class="prompts">
            <h3 class="prompt_name" contenteditable="false">${data.content[index].title}</h3>
            <div class="prompt_content" contenteditable="true">${convertNewlinesAndSpacesToHTML(data.content[index].content)}</div>
            <div class="buttonbar">
                <button class="savebtn"><i class="fa fa-save"></i></button>
                <button class="deletebtn"><i class="fa fa-trash"></i></button>
            </div>
        </div>`;  
        }
        interaction.innerHTML+=`<div class="prompts-new" id="prompt_new">
            <i class="fa fa-plus-square"></i>
        </div>`;
        document.getElementById('prompt_new').addEventListener('click',()=>{
            let newhtml=document.createElement('div');
            newhtml.innerHTML=`<div class="new_prompts">
                <h3 class="prompt_name" contenteditable="true">Create your prompt here 👇</h3>
                <div class="prompt_content" contenteditable="true">Click to edit  ✏️</div>
                <div class="buttonbar">
                <button class="savebtn"><i class="fa fa-save"></i></button>
                <button class="deletebtn"><i class="fa fa-trash"></i></button>
                </div>
            </div>`;
            document.getElementById('prompt_new').parentNode.insertBefore(newhtml, document.getElementById('prompt_new'));
            interaction.scrollTop=interaction.scrollHeight;
            document.querySelectorAll('.new_prompts').forEach(element=>{
                element.querySelector(".savebtn").addEventListener('click',()=>{
                    fetch('/newPrompt',{
                        method:'POST',
                        body:JSON.stringify({
                            "title":element.querySelector(".prompt_name").innerText,
                            "content":element.querySelector(".prompt_content").innerText
                        })
                    })
                    alert("Created successfully!");
                })
                element.querySelector(".deletebtn").addEventListener('click',()=>{
                    fetch('/deletePrompt',{
                        method:'POST',
                        body:JSON.stringify({
                            "title":element.querySelector(".prompt_name").innerText
                        })
                    })
                    element.remove();
                    alert("Deleted successfully!");
                })
            })
        });
        document.querySelectorAll('.prompts').forEach(element=>{
            element.querySelector(".savebtn").addEventListener('click',()=>{
                fetch('/updatePrompt',{
                    method:'POST',
                    body:JSON.stringify({
                        "title":element.querySelector(".prompt_name").innerText,
                        "content":element.querySelector(".prompt_content").innerText
                    })
                })
                alert("Saved successfully!");
            })
            element.querySelector(".deletebtn").addEventListener('click',()=>{
                if (confirm("Are you sure to delete?")){
                    fetch('/deletePrompt',{
                        method:'POST',
                        body:JSON.stringify({
                            "title":element.querySelector(".prompt_name").innerText,
                        })
                    })
                    element.remove();
                    alert("Delete successfully!");
                }
            });
        });
    })
    .catch((error) => {
        console.error("Error:", error);
    });
});
toggle_sidebar.addEventListener('click',()=>{
    var sidebar = document.getElementById("sidebar");
    toggle_sidebar.innerHTML = (toggle_sidebar.innerHTML==`<i class="fa fa-angle-double-right"></i>`)? `<i class="fa fa-angle-double-left"></i>`:`<i class="fa fa-angle-double-right"></i>`;
    sidebar.style.left = (sidebar.style.left === "-150px" || sidebar.style.left === "") ? "0px" : "-150px";
});
settings.addEventListener('click',()=>{
    window.location.href="/settings";
});
usage.addEventListener('click',()=>{
    window.open("https://platform.openai.com/usage", '_blank');
});
down.addEventListener('click',()=>{
    interaction.scrollTop=interaction.scrollHeight;
    down.style.display='none';
});
function checkscrolltop(){
    if(interaction.scrollTop+5<interaction.scrollHeight-interaction.clientHeight){
        down.style.display='block';
    }else{
        down.style.display='none';
    }
}
setInterval(checkscrolltop, 100);
function allowDrop(event) {
    event.preventDefault();
}
async function showText(text){
    for(index=0;index < text.length; index++){

    }
}
function generateRandomString(length) {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
}
async function load_sidebar(){
    try{
        const response=await fetch('/getSidebar',{
            method:'POST',
            headers:{
                'Content-Type': 'application/json'
            }
        });
        const data=await response.json();
        for(let index=data.rows.length-1;index>=0;index--){
            historychat.innerHTML+=`<button class="btn" id="${data.rows[index].chatid}">${data.rows[index].chatid}</button>`;
        }
        for(let index=data.rows.length-1;index>=0;index--){
            document.getElementById(`${data.rows[index].chatid}`).addEventListener('contextmenu',()=>{
                event.preventDefault();
                const deleteBtn = document.getElementById('deleteBtn');
                deleteBtn.style.display = 'block';
                deleteBtn.style.left = event.clientX + 'px';
                deleteBtn.style.top = event.clientY + 'px';

                deleteBtn.onclick = function() {
                    document.getElementById(`${data.rows[index].chatid}`).remove();
                    fetch('/deleteChat',{
                        method:'POST',
                        body:JSON.stringify({
                            "chatid":data.rows[index].chatid
                        })
                    })
                    deleteBtn.style.display = 'none';
                    localStorage.setItem("chatid","");
                    document.getElementById('new-chat').click();
                };

                document.addEventListener('click', function(e) {
                    if (e.target !== deleteBtn && e.target !== document.getElementById(`${data.rows[index].chatid}`)) {
                        deleteBtn.style.display = 'none';
                    }
                });
            });
            document.getElementById(`${data.rows[index].chatid}`).addEventListener('click',()=>{
                localStorage.setItem("chatid",data.rows[index].chatid);
                window.location.reload();
                fetch('/loadDialogue',{
                    method:'POST',
                    body:JSON.stringify({"chatid":data.rows[index].chatid})
                })
                .then((response=>response.json()))
                .then((data)=>{
                    interaction.innerHTML='';
                    toggle_sidebar.click();
                    let msgs=JSON.parse(`${data.content}`);
                    messages=msgs;
                    for(let index=1;index<msgs.length;index+=2){
                        interaction.innerHTML+=`<div class="dlg"><h2>You</h2><div class="text">${convertNewlinesAndSpacesToHTML(msgs[index].content)}</div>`;
                        interaction.innerHTML+=`<div class="dlg"><h2>Assistant</h2><div class="text">${marked(msgs[index+1].content)}</div>`;
                    }
                    interaction.scrollTop=interaction.scrollHeight;
                    document.querySelectorAll('.copy-code-btn').forEach(element=>{
                        element.remove();
                    })
                    document.querySelectorAll('pre').forEach(function(preElement) {
                        createCopyButton(preElement);
                    });
                });
            });
        }
        document.getElementById('new-chat').addEventListener('click',addNewChat);
    }catch(error){
        console.log(error);
        return null;
    }
}
function createCopyButton(preElement) {
    var copyButton = document.createElement('button');
    copyButton.className = 'copy-code-btn';
    copyButton.innerHTML = '<i class="fa fa-copy"></i>';
    copyButton.onclick = function() {
        var codeElement = preElement.querySelector('code');
        if (codeElement) {
            var code = codeElement.textContent;
            navigator.clipboard.writeText(code).then(function() {
                console.log('Code copied to clipboard:', code);
                alert('Code copied to clipboard!');
            }).catch(function(err) {
                console.error('Failed to copy code:', err);
                alert('Failed to copy code!');
            });
        }
    };
    preElement.insertAdjacentElement('beforebegin', copyButton);
}
function convertNewlinesAndSpacesToHTML(text) {
    text = text.replace(/\n/g, "<br>");
    text = text.replace(/ /g, "&nbsp;");
    return text;
}
async function loadDialogue(chatid){
    fetch('/loadDialogue',{
        method:'POST',
        body:JSON.stringify({"chatid":chatid})
    })
    .then((response=>response.json()))
    .then((data)=>{
        interaction.innerHTML='';
        let msgs=JSON.parse(`${data.content}`);
        messages=msgs;
        for(let index=1;index<msgs.length;index+=2){
            interaction.innerHTML+=`<div class="dlg"><h2>You</h2><div class="text">${convertNewlinesAndSpacesToHTML(msgs[index].content)}</div>`;
            interaction.innerHTML+=`<div class="dlg"><h2>Assistant</h2><div class="text">${marked(msgs[index+1].content)}</div>`;
        }
        interaction.scrollTop=interaction.scrollHeight;
        document.querySelectorAll('.copy-code-btn').forEach(element=>{
            element.remove();
        })
        document.querySelectorAll('pre').forEach(function(preElement) {
            createCopyButton(preElement);
        });
    });
}
var isFirstKeyPressed=false;
document.addEventListener("keydown", function(event) {
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    if (isMac && event.metaKey && event.key === 'Meta') {
        isFirstKeyPressed = true;
    } else if (!isMac && event.ctrlKey && event.key === 'Control') {
        isFirstKeyPressed = true;
    } else if(isFirstKeyPressed && event.key === 'Enter'){
        event.preventDefault();
        send.click();
        isFirstKeyPressed = false;
    } else {
        isFirstKeyPressed = false;
    }
});

window.onload=async ()=>{
    document.getElementById('query').value=localStorage.getItem("query");
    var ID=localStorage.getItem("chatid");
    load_sidebar();
    if(ID==""||ID==null){
        document.getElementById('new-chat').click();
    }else{
        await loadDialogue(ID);
    }
}