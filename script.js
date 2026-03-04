// расчет возраста

const birthDate = new Date("2010-02-03")
const today = new Date()

let age = today.getFullYear() - birthDate.getFullYear()

const m = today.getMonth() - birthDate.getMonth()

if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
age--
}

document.getElementById("age").textContent = age



// загрузка рейтингов

fetch("fide.json")
.then(response => response.json())
.then(data => {

document.getElementById("fideStandard").textContent = data.standard
document.getElementById("fideRapid").textContent = data.rapid
document.getElementById("fideBlitz").textContent = data.blitz

})
.catch(error => console.error("Ошибка загрузки рейтингов:", error))
