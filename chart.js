document.addEventListener("DOMContentLoaded", () => {

const history = [
{date:"2019-12", std:null, rapid:null, blitz:1007},
{date:"2020-04", std:null, rapid:1001, blitz:1007},
{date:"2021-03", std:null, rapid:1019, blitz:1003},
{date:"2022-01", std:null, rapid:1026, blitz:1009},
{date:"2023-01", std:null, rapid:1163, blitz:1239},
{date:"2024-01", std:1145, rapid:1503, blitz:1420},
{date:"2025-01", std:1531, rapid:1767, blitz:1673},
{date:"2026-03", std:1574, rapid:1852, blitz:1737}
]

// сортировка по времени
history.sort((a,b)=>new Date(a.date)-new Date(b.date))

const labels = history.map(h=>h.date)
const classic = history.map(h=>h.std)
const rapid = history.map(h=>h.rapid)
const blitz = history.map(h=>h.blitz)

// изменения рейтинга
const rapidChange = rapid.map((v,i)=>{
if(i===0 || rapid[i-1]===null) return null
return v-rapid[i-1]
})

// peak рейтинг
const peakRapid = Math.max(...rapid.filter(v=>v!==null))
const peakIndex = rapid.indexOf(peakRapid)

const ctx = document.getElementById("ratingChart")

new Chart(ctx,{
type:"line",
data:{
labels:labels,
datasets:[
{
label:"Classic",
data:classic,
borderColor:"#60a5fa",
tension:0.35,
pointRadius:3
},
{
label:"Rapid",
data:rapid,
borderColor:"#22c55e",
tension:0.35,
pointRadius: rapid.map((v,i)=> i===peakIndex ? 7 : 3)
},
{
label:"Blitz",
data:blitz,
borderColor:"#ef4444",
tension:0.35,
pointRadius:3
}
]
},
options:{
plugins:{
legend:{labels:{color:"white"}},
tooltip:{
callbacks:{
afterLabel:function(context){

if(context.dataset.label==="Rapid"){

const change = rapidChange[context.dataIndex]

if(change===null) return ""

if(change>0) return "Рост: ▲ +" + change
if(change<0) return "Падение: ▼ " + change
}

return ""
}
}
}
},
scales:{
x:{ticks:{color:"white"}},
y:{ticks:{color:"white"}}
}
}
})

})
