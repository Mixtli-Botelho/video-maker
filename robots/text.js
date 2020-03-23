// Importa o módulo do marketplace "Algorithmia"
const algorithmia = require('algorithmia')
// Importa o "código chave" para utiliação de códigos da Algorithmia guardada no arquivo "algorithmia.json"
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
// Imoprta uma biblioteca do Node de "detecção de limite de sentença"
const sentenceBoundaryDetection = require('sbd')

// Importa o "código chave" para a utilização das APIs do Watson
const watsonApiKey = require("../credentials/watson-nlu.json").apikey
// Importa o submódulo "natural-language-understanding" para a análise natural das frases
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')

// instância que pede uma "apiKey, version, url" (https://www.npmjs.com/package/watson-developer-cloud)
const nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

// Importa o modulo "state.js" para gravar os dados em um arquivo do tipo ".json"
const state = require('./state.js') 

// início do robô de texto
async function robot() {
    const content = state.load()

    await fetchContentFromWikipedia(content) // Busca o conteúdo da Wikipedia
    sanitizeContent(content) // Limpa o conteúdo pesquisado, tirando caracteres especiais (do Markdown)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

    state.save(content)

    async function fetchContentFromWikipedia(content) {
        // Autenticação no "Algorithmia" com uma "API KEY"
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        // Busca o algoritmo no "Algorithmia" que vai ser utilizado (nesse caso é o "Wikipedia Parser")
        const wikipediaAlgorithmia = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2")
        // Executa o método "pipe()" desse algoritmo para buscar um conteúdo no "Wikipedia"
        const wikipediaResponse = await wikipediaAlgorithmia.pipe(content.searchTerm)
        // Executa o método "get()" para pegar e guardar esse conteúdo na constante "wikipediaContent"
        const wikipediaContent = wikipediaResponse.get()

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content) {     
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith("=")) {
                    return false
                } else {
                    return true
                }
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }

        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    }

    function breakContentIntoSentences(content) {
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)

        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

    function limitMaximumSentences(content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(content) {
        for (const sentence of content.sentences) {
            sentence.keywords = await fetchWatsonAndReturnKeyWords(sentence.text)
        }
    } 

    async function fetchWatsonAndReturnKeyWords(sentence) {
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                    if (error) {
                        throw error
                    }
    
                    const keywords = response.keywords.map((keyword) => {
                        return keyword.text
                    })
    
                    resolve(keywords)
                })
        })  
    }
}

module.exports = robot