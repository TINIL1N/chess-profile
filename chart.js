const history = [

{date:"2019-12", classic:null, rapid:null, blitz:1007},
{date:"2020-04", classic:null, rapid:1001, blitz:1007},
{date:"2021-03", classic:null, rapid:1019, blitz:1003},
{date:"2021-07", classic:null, rapid:1002, blitz:1000},
{date:"2022-01", classic:null, rapid:1026, blitz:1009},
{date:"2022-11", classic:null, rapid:1067, blitz:1009},
{date:"2023-04", classic:null, rapid:1180, blitz:1304},
{date:"2023-08", classic:1145, rapid:1374, blitz:1275},
{date:"2023-12", classic:1145, rapid:1587, blitz:1420},
{date:"2024-02", classic:1216, rapid:1503, blitz:1420},
{date:"2024-07", classic:1536, rapid:1788, blitz:1652},
{date:"2025-01", classic:1531, rapid:1767, blitz:1673},
{date:"2025-10", classic:1574, rapid:1821, blitz:1821},
{date:"2026-03", classic:1574, rapid:1852, blitz:1737}

]



const labels = history.map(h => h.date)
const classic = history.map(h => h.classic)
const rapid = history.map(h => h.rapid)
const blitz = history.map(h => h.blitz)



// поиск пикового рейтинга
let peak = {
rating:0,
type:"",
date:""
}

history.forEach(h=>{

if(h.classic && h.classic > peak.rating){
peak.rating = h.classic
peak.type = "Classic"
peak.date = h.date
}

if(h.rapid && h.rapid > peak.rating){
peak.rating = h.rapid
peak.type = "Rapid"
peak.date = h.date
}

if(h.blitz && h.blitz > peak.rating){
peak.rating = h.blitz
peak.type = "Blitz"
peak.date = h.date
}

})



// создаём подпись под графиком
const peakBlock = document.createElement("div")
peakBlock.style.marginTop = "12px"
peakBlock.style.color = "#9ca3af"
peakBlock.style.fontSize = "14px"

peakBlock.innerHTML =
"Peak rating: <b style='color:white'>" +
peak.rating +
"</b> (" +
peak.type +
", " +
peak.date +
")"

document.querySelector(".section canvas").after(peakBlock)



// график
const ctx = document.getElementById("ratingChart")

new Chart(ctx, {

type: "line",

data: {

labels,

datasets: [

{
label:"Classic",
data:classic,
borderColor:"#60a5fa",
tension:0.3
},

{
label:"Rapid",
data:rapid,
borderColor:"#22c55e",
tension:0.3
},

{
label:"Blitz",
data:blitz,
borderColor:"#ef4444",
tension:0.3
}

]

},

options:{

plugins:{
legend:{
labels:{color:"white"}
}
},

scales:{
x:{ticks:{color:"white"}},
y:{ticks:{color:"white"}}
}

}

})
