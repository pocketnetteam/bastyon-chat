const fs = require('fs')
const functionData = "export default function isMessenger() {return " + (process.argv[2] === 'true' ? 'true' : 'false') + ";}"
fs.writeFile("src/application/isMessenger.js", functionData, function(error){if(error) throw error;});