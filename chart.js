const ratingHistory = [
{date:"2019-12", std:null, rapid:null, blitz:1007},
{date:"2020-04", std:null, rapid:1001, blitz:1007},
{date:"2021-03", std:null, rapid:1019, blitz:1003},
{date:"2022-01", std:null, rapid:1026, blitz:1009},
{date:"2023-01", std:null, rapid:1163, blitz:1239},
{date:"2024-01", std:1145, rapid:1503, blitz:1420},
{date:"2025-01", std:1531, rapid:1767, blitz:1673},
{date:"2026-03", std:1574, rapid:1852, blitz:1737}
]

const history = [...ratingHistory]

const labels = history.map(h => h.date)
const classic = history.map(h => h.std)
const rapid = history.map(h => h.rapid)
const blitz = history.map(h => h.blitz)

const ctx = document.getElementById('ratingChart')

new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[
{
label:'Classic',
data:classic,
borderColor:'#60a5fa',
tension:0.3
},
{
label:'Rapid',
data:rapid,
borderColor:'#22c55e',
tension:0.3
},
{
label:'Blitz',
data:blitz,
borderColor:'#ef4444',
tension:0.3
}
]
},
options:{
plugins:{
legend:{labels:{color:'white'}}
},
scales:{
x:{ticks:{color:'white'}},
y:{ticks:{color:'white'}}
}
}
})
