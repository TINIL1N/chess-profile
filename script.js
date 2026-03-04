document.addEventListener("DOMContentLoaded", () => {

const birthDate = new Date("2010-02-03")
const today = new Date()

let age = today.getFullYear() - birthDate.getFullYear()
const m = today.getMonth() - birthDate.getMonth()

if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
age--
}

const ageElement = document.getElementById("age")
if(ageElement){
ageElement.textContent = age
}

fetch("fide.json")
.then(r => r.json())
.then(data => {

const std = document.getElementById("fideStandard")
const rapid = document.getElementById("fideRapid")
const blitz = document.getElementById("fideBlitz")

if(std) std.textContent = data.standard
if(rapid) rapid.textContent = data.rapid
if(blitz) blitz.textContent = data.blitz

})
.catch(e => console.log("Ошибка загрузки FIDE:", e))

})
