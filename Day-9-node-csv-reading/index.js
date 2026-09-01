const fs = require("fs")

const data = fs.readFileSync("data.csv", "utf-8")

console.log(data);