document.addEventListener("DOMContentLoaded", () => {

const birthDate = new Date("2010-02-03")
const today = new Date()

let age = today.getFullYear() - birthDate.getFullYear()
const m = today.getMonth() - birthDate.getMonth()

if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
age--
}

const about = document.getElementById("aboutText")

if(about){
about.textContent =
age + "-летний шахматист из Челябинска. Участник и призёр международных турниров FIDE. Тренирую детей и взрослых любого уровня — от первых шагов до турнирной подготовки."
}


function arrow(diff){

if(diff > 0){
return `<span style="color:#22c55e"> ▲ +${diff}</span>`
}

if(diff < 0){
return `<span style="color:#ef4444"> ▼ ${diff}</span>`
}

return `<span style="color:#9ca3af"> → 0</span>`
}


fetch("fide.json")
.then(response => response.json())
.then(data => {

const prev = data.previous || {}

const stdDiff = data.standard - (prev.standard ?? data.standard)
const rapidDiff = data.rapid - (prev.rapid ?? data.rapid)
const blitzDiff = data.blitz - (prev.blitz ?? data.blitz)

document.getElementById("fideStandard").innerHTML =
data.standard + arrow(stdDiff)

document.getElementById("fideRapid").innerHTML =
data.rapid + arrow(rapidDiff)

document.getElementById("fideBlitz").innerHTML =
data.blitz + arrow(blitzDiff)

})
.catch(err => console.log("Ошибка загрузки рейтингов:", err))

})
