const back=document.getElementById('back');
const savesettings=document.getElementById('savesettings');
const temperature_val=document.getElementById('temperature_val');
const presence_penalty_val=document.getElementById('presence_penalty_val');
const frequency_penalty_val=document.getElementById('frequency_penalty_val');
const max_tokens_val=document.getElementById('max_tokens_val');
back.addEventListener('click',()=>{
    window.location.href='/chat';
});
temperature_val.addEventListener('input',()=>{
    document.getElementById('temperature').innerHTML=`temperature ${(temperature_val.value/10).toFixed(1)}`;
})
frequency_penalty_val.addEventListener('input',()=>{
    document.getElementById('frequency_penalty').innerHTML=`frequency penalty ${(frequency_penalty_val.value/10).toFixed(1)}`;
})
presence_penalty_val.addEventListener('input',()=>{
    document.getElementById('presence_penalty').innerHTML=`presence penalty ${(presence_penalty_val.value/10).toFixed(1)}`;
})
max_tokens_val.addEventListener('input',()=>{
    document.getElementById('max_tokens').innerHTML=`max tokens <p contenteditable="true" id="edit_max_tokens">${(max_tokens_val.value)}</p> <i class="fa fa-pencil"></i>`;
})
document.addEventListener('keydown',()=>{
    if(event.code=='Enter'){
        event.preventDefault();
        document.getElementById('edit_max_tokens').blur();
        
        const regex = /[a-zA-Z]/;
        const containsLetters = regex.test(document.getElementById('edit_max_tokens').innerText);

        if (containsLetters) {
            document.getElementById('max_tokens').innerHTML=`max tokens <p contenteditable="true" id="edit_max_tokens">1024</p> <i class="fa fa-pencil"></i>`;
            max_tokens_val.value=16;
        } else {
            if(parseInt(document.getElementById('edit_max_tokens').innerText)<512){
                document.getElementById('edit_max_tokens').innerText="512";
            }
            if(parseInt(document.getElementById('edit_max_tokens').innerText)>1296){
                document.getElementById('edit_max_tokens').innerText="1296";
            }
            max_tokens_val.value=parseInt(document.getElementById('edit_max_tokens').innerText);
        }
    }
})
savesettings.addEventListener('click',()=>{
    const data={
        "temperature":parseFloat(temperature_val.value/10),
        "frequency_penalty":parseFloat(frequency_penalty_val.value/10),
        "presence_penalty":parseFloat(presence_penalty_val.value/10),
        "max_tokens":parseInt(max_tokens_val.value)
    }
    fetch('/saveSettings',{
        method:'POST',
        body:JSON.stringify(data)
    }).then(()=>{    
        alert('Saved successfully');
    }).catch((error)=>{
        alert('Something went wrong, try again later');
        console.error("Error",error);
    });
});
async function getPreference(){
    try{
        const response=await fetch('/getPreference',{
            method:'POST',
            headers:{
                'Content-Type': 'application/json'
            }
        });
        const data=await response.json();
        console.log(data);
        temperature_val.value=data.temperature*10;
        frequency_penalty_val.value=data.frequency_penalty*10;
        presence_penalty_val.value=data.presence_penalty*10;
        max_tokens_val.value=data.max_tokens;
        
        document.getElementById('temperature').innerHTML=`temperature ${(data.temperature).toFixed(1)}`;
        document.getElementById('frequency_penalty').innerHTML=`frequency penalty ${(data.frequency_penalty).toFixed(1)}`;
        document.getElementById('presence_penalty').innerHTML=`presence penalty ${(data.presence_penalty).toFixed(1)}`;
        document.getElementById('max_tokens').innerHTML=`max tokens <p contenteditable="true" id="edit_max_tokens">${data.max_tokens}</p> <i class="fa fa-pencil"></i>`;
    }catch(error){
        console.log(error);
        return null;
    }
}
window.onload=async ()=>{
    await getPreference();
}