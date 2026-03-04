fetch("rating_history.json")
.then(r => r.json())
.then(data => {

const labels = data.history.map(x => x.date).reverse()

const standard = data.history.map(x => x.standard).reverse()
const rapid = data.history.map(x => x.rapid).reverse()
const blitz = data.history.map(x => x.blitz).reverse()

new Chart(document.getElementById("ratingChart"),{
type:"line",
data:{
labels:labels,
datasets:[
{
label:"Classic",
data:standard,
borderColor:"#60a5fa",
spanGaps:true
},
{
label:"Rapid",
data:rapid,
borderColor:"#22c55e",
spanGaps:true
},
{
label:"Blitz",
data:blitz,
borderColor:"#ef4444",
spanGaps:true
}
]
},
options:{
responsive:true,
plugins:{
legend:{labels:{color:"white"}}
},
scales:{
x:{ticks:{color:"white"}},
y:{ticks:{color:"white"}}
}
}
})

})
