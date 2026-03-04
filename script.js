fetch("rating_history.json")
.then(r => r.json())
.then(data => {

const labels = data.history.map(i => i.date).reverse()

const standard = data.history.map(i => i.standard).reverse()
const rapid = data.history.map(i => i.rapid).reverse()
const blitz = data.history.map(i => i.blitz).reverse()

const ctx = document.getElementById("ratingChart")

new Chart(ctx,{
type:"line",
data:{
labels:labels,
datasets:[
{
label:"Classic",
data:standard,
borderColor:"#60a5fa",
backgroundColor:"transparent",
spanGaps:true
},
{
label:"Rapid",
data:rapid,
borderColor:"#22c55e",
backgroundColor:"transparent",
spanGaps:true
},
{
label:"Blitz",
data:blitz,
borderColor:"#ef4444",
backgroundColor:"transparent",
spanGaps:true
}
]
},
options:{
responsive:true,
plugins:{
legend:{
labels:{color:"white"}
}
},
scales:{
x:{
ticks:{color:"white"},
grid:{color:"#1f2937"}
},
y:{
ticks:{color:"white"},
grid:{color:"#1f2937"}
}
}
}
})

})
