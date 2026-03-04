document.addEventListener("DOMContentLoaded", () => {

// возраст
const birthDate = new Date("2010-02-03")
const today = new Date()

let age = today.getFullYear() - birthDate.getFullYear()

const m = today.getMonth() - birthDate.getMonth()

if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
age--
}

document.getElementById("age").textContent = age


// FIDE рейтинги
fetch("fide.json")
.then(r => r.json())
.then(data => {

document.getElementById("fideStandard").textContent = data.standard
document.getElementById("fideRapid").textContent = data.rapid
document.getElementById("fideBlitz").textContent = data.blitz

})
.catch(e => console.log(e))

})
