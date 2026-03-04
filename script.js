// возраст

const birthDate = new Date("2010-02-03")
const today = new Date()

let age = today.getFullYear() - birthDate.getFullYear()

const m = today.getMonth() - birthDate.getMonth()

if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
age--
}

document.getElementById("age").textContent = age



// загрузка рейтингов РШФ

fetch("https://ratings.ruchess.ru/api/people/170586")
.then(response => response.json())
.then(data => {

document.getElementById("fideStandard").textContent = data.rating_classic
document.getElementById("fideRapid").textContent = data.rating_rapid
document.getElementById("fideBlitz").textContent = data.rating_blitz

})
.catch(error => {

console.log("Не удалось загрузить рейтинг", error)

})
