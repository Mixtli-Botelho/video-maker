const readline = require('readline-sync') // Importa a biblioteca "readline-sync"
const state = require('./state.js') // Importa o múdulo "state.js"

function robot() {
    // Objeto para guardar todos os dados da pesquisa
    const content = {
        maximumSentences: 7
    }

    content.searchTerm = askAndReturnSearchTerm() // Cria o atributo que guardará o "Termo de Busca"
    content.prefix = askAndReturnPrefix() // Cria o atributo que guardará o "Prefixo da Busca"
    state.save(content) // Salva os dados do objeto "content()" num arquivo chamado "content.json"

    function askAndReturnSearchTerm() {
        // Pede o termo de busca como input no terminal utilizando a biblioteca "readline-sync"
        return readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix() {
        // Vetor dos prefixos
        const prefixes = ['Who is', 'What is', 'The history of']
        // Guarda o índice do prefixo selecionado
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose an option for: ')
        // Guarda o texto do prefixo selecionado
        const selectedPrefixText = prefixes[selectedPrefixIndex]

        return selectedPrefixText
    }
}

module.exports = robot // Exporta a função robot()