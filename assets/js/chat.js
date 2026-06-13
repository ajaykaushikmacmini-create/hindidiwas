// ============================================================
// Gemini chat with SMART FALLBACK.
// If the API key is missing, credits run out, or any error
// occurs, the assistant still answers using a built-in
// agriculture knowledge base so the user never gets a blank.
// ============================================================

// --- Built-in offline knowledge base (Hindi + English) ---
const KB = [
  {k:['wheat','gehu','gehoon','गेहूं','गेहू'],a:'Wheat / गेहूं: Sow Nov-Dec. Use DAP at sowing and urea in 2 splits. Irrigate at crown-root, tillering and grain stages. | गेहूं की बुवाई नवंबर-दिसंबर में करें। बुवाई पर DAP और बाद में 2 बार यूरिया डालें।'},
  {k:['rice','dhan','paddy','धान','चावल'],a:'Rice / धान: Keep nursery healthy, transplant 25-30 day seedlings. Maintain 2-5 cm water. Use balanced NPK. | धान: 25-30 दिन की पौध रोपें, खेत में 2-5 से.मी. पानी रखें, संतुलित NPK दें।'},
  {k:['tomato','tamatar','टमाटर'],a:'Tomato / टमाटर: Needs well-drained soil, support staking. Spray for blight in humidity. Use FYM + balanced fertilizer. | टमाटर: अच्छी जल निकासी वाली मिट्टी, सहारा दें, नमी में झुलसा रोग के लिए छिड़काव करें।'},
  {k:['fertilizer','khad','खाद','urea','dap','npk'],a:'Fertilizer / खाद: Always do a soil test first. Generally use NPK as basal dose and urea as top dressing. Add organic compost/FYM. | खाद: पहले मिट्टी जांच कराएं। आमतौर पर NPK बेसल और यूरिया टॉप ड्रेसिंग दें, गोबर की खाद मिलाएं।'},
  {k:['pest','keet','insect','कीट','कीड़ा','disease','rog','रोग'],a:'Pests & disease / कीट-रोग: Use IPM - neem oil, pheromone traps, and recommended pesticide only when needed. Remove infected plants. | कीट-रोग: नीम तेल, ट्रैप और ज़रूरत पर ही सही दवा का छिड़काव करें, रोगग्रस्त पौधे हटाएं।'},
  {k:['irrigation','sinchai','सिंचाई','water','pani','पानी'],a:'Irrigation / सिंचाई: Drip irrigation saves water. Irrigate early morning or evening. Avoid waterlogging. | सिंचाई: ड्रिप से पानी बचता है। सुबह या शाम सिंचाई करें, जलभराव से बचें।'},
  {k:['weather','mausam','मौसम','rain','barish','बारिश'],a:'Weather / मौसम: Check forecast before sowing or spraying. After heavy rain, ensure drainage and avoid fertilizer runoff. | मौसम: बुवाई या छिड़काव से पहले पूर्वानुमान देखें। तेज़ बारिश के बाद जल निकासी का ध्यान रखें।'},
  {k:['soil','mitti','मिट्टी'],a:'Soil / मिट्टी: Test soil every 1-2 years for pH and nutrients. Add organic matter to improve health. | मिट्टी: हर 1-2 साल में pH और पोषक तत्वों की जांच कराएं, जैविक खाद मिलाएं।'}
];

function localAnswer(q){
  const t=(q||'').toLowerCase();
  for(const item of KB){
    if(item.k.some(w=>t.includes(w.toLowerCase()))) return item.a;
  }
  return 'General farming tip / सामान्य सलाह: Do a soil test, use certified seeds, balanced fertilizer, timely irrigation and IPM for pests. For your exact crop, please share the crop name. | मिट्टी जांच कराएं, प्रमाणित बीज, संतुलित खाद, सही समय पर सिंचाई करें। अपनी फसल का नाम बताएं।';
}

async function askGemini(prompt){
  const cfg = window.HINDIDIWAS_CONFIG || {};
  const key = cfg.GEMINI_API_KEY;
  const model = cfg.GEMINI_MODEL || 'gemini-1.5-flash';
  // No key -> use local KB silently
  if(!key || key.includes('YAHAN_APNI')){
    return localAnswer(prompt);
  }
  const sys = 'Aap ek madadgar krishi (agriculture) sahayak hain. Bharat ke kisaano ko saral Hindi mein kheti, fasal, mausam, khaad, keet aur sinchai ke baare mein practical salah dein. Jawab chote aur samajhne mein aasan rakhein.';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  try{
    const res = await fetch(url,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        systemInstruction:{parts:[{text:sys}]},
        contents:[{role:'user',parts:[{text:prompt}]}]
      })
    });
    const data = await res.json();
    // API returned an error (e.g. quota/credits over, bad key) -> fallback
    if(data.error || !res.ok){
      return localAnswer(prompt);
    }
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text && text.trim() ? text : localAnswer(prompt);
  }catch(e){
    // Network / any failure -> fallback
    return localAnswer(prompt);
  }
}

function addMsg(text,who){
  const body=document.getElementById('chatBody');
  const div=document.createElement('div');
  div.className='msg '+who;
  div.textContent=text;
  body.appendChild(div);
  body.scrollTop=body.scrollHeight;
  return div;
}

async function sendChat(text){
  const input=document.getElementById('chatInput');
  const q=text||input.value.trim();
  if(!q) return;
  addMsg(q,'user');
  input.value='';
  const loading=addMsg('...','bot');
  const ans=await askGemini(q);
  loading.textContent=ans;
  document.getElementById('chatBody').scrollTop=99999;
}

document.addEventListener('DOMContentLoaded',function(){
  const form=document.getElementById('chatForm');
  if(form) form.addEventListener('submit',e=>{e.preventDefault();sendChat();});
  document.querySelectorAll('.chip').forEach(c=>{
    c.addEventListener('click',()=>sendChat(c.textContent.trim()));
  });
});
