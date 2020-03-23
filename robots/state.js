const fs = require('fs') // Módulo "File System" do Node.js
const contentFilePath = './content.json' // Nome do arquivo e o caminho onde os dados do "content{}" serão gravados

function save(content) {
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath, contentString)
}

function load() {
    const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

module.exports = { save, load } // Exporta as funções save() e load() 