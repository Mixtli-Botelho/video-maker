// Importa o módulo do marketplace "Algorithmia"
const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

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
                keyword: [],
                images: []
            })
        })
    }
}

module.exports = robot