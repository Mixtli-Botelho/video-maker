// Importa a biblioteca "readline-sync"
const readline = require('readline-sync')
// Cria um objeto para armazenar os robôs como seus atributos
const robots = {
    text: require('./robots/text.js')
}

// Função para iniciar tudo
async function start() {
    // Objeto para guardar todos os dados da pesquisa
    const content = {}

    content.searchTerm = askAndReturnSearchTerm() // Cria o atributo que guardará o "Termo de Busca"
    content.prefix = askAndReturnPrefix() // Cria o atributo que guardará o "Prefixo da Busca"

    await robots.text(content)

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

    console.log(content)
}

start()
