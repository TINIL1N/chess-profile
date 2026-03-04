document.addEventListener("DOMContentLoaded", () => {

// дата рождения
const birthDate = new Date("2010-02-03")
const today = new Date()

let age = today.getFullYear() - birthDate.getFullYear()
const m = today.getMonth() - birthDate.getMonth()

if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
age--
}

// описание
document.getElementById("aboutText").textContent =
age + "-летний шахматист из Челябинска. Участник и призёр международных турниров FIDE. Тренирую детей и взрослых любого уровня — от первых шагов в шахматах до турнирной подготовки."


// стрелки изменения рейтинга
function arrow(diff){

if(diff > 0){
return `<span style="color:#22c55e;font-weight:600"> ▲ +${diff}</span>`
}

if(diff < 0){
return `<span style="color:#ef4444;font-weight:600"> ▼ ${diff}</span>`
}

return `<span style="color:#9ca3af"> → 0</span>`
}


// загрузка рейтингов
fetch("fide.json")
.then(r => r.json())
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
.catch(e => console.log("Ошибка загрузки рейтингов:", e))

})
