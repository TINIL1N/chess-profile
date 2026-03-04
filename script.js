// дата рождения
const birthDate = new Date("2010-02-03")

const today = new Date()

let age = today.getFullYear() - birthDate.getFullYear()

const m = today.getMonth() - birthDate.getMonth()

if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
age--
}

document.getElementById("age").textContent = age



// загрузка рейтингов FIDE

fetch("fide.json")
.then(response => response.json())
.then(data => {

document.getElementById("fideStandard").textContent = data.standard

document.getElementById("fideRapid").textContent = data.rapid

document.getElementById("fideBlitz").textContent = data.blitz

})

// дата обновления рейтингов

const now = new Date()

const options = {
year: "numeric",
month: "long",
day: "numeric"
}

document.getElementById("updateDate").textContent =
now.toLocaleDateString("ru-RU", options)
