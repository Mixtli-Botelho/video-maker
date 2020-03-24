// Cria um objeto para armazenar os robôs como seus atributos
const robots = {
    input: require('./robots/input.js'), // Armazena o múdulo "input.js" como propriedade do objeto "robots{}"
    text: require('./robots/text.js'), // Armazena o múdulo "text.js" como propriedade do objeto "robots{}"
    state: require('./robots/state.js'), // Armazena o módulo "state.js" como propriedade do objeto "robots{}"
    image: require('./robots/image.js') // Armazena o módulo "image.js" como propriedade do objeto "robots{}"
}

// Função para iniciar tudo
async function start() {
    
    // robots.input() // Executa o conteúdo do módulo "input.js"
    // await robots.text() // Executa o conteúdo do módulo "text.js"
    await robots.image() // Executa o conteúdo do módulo "image.js"

    const content = robots.state.load() // Pega o resultado do método "load()" do módulo "state.js"
    console.dir(content, { depth: null })
}

start()
