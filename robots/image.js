const imageDownloader = require('image-downloader')
const { google } = require('googleapis') // Importa o módulo de API's do Google
const customSearch = google.customsearch('v1') // Faz uma instância do módulo "customsearch" das API's do Google
const state = require('./state.js')

const googleSearchCredentials = require('../credentials/google-search.json')

async function robot() {
    const content = state.load()

    await fetchImagesOfAllSentences(content)
    await downloadAllImages(content)

    state.save(content)

    async function fetchImagesOfAllSentences(content) {
        for (const sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImagesLinks(query)

            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query) {
        // cse => Custom Search Engine (Mecanismo de Busca Customizado/Personalizado) -> Propriedade do "customsearch"
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey, // Atenticação da API Key
            cx: googleSearchCredentials.searchEngineId, // ID do Mecanismo de Busca criado
            q: query, // O Termo de busca requisitado
            searchType: 'image', // Tipo de busca, no caso é por imagem
            num: 2 // O número de resultados da busca 
        })

        // mapeia cada item da busca, pegando o link da imagem
        const imagesUrl = response.data.items.map((item) => {
            return item.link
        })

        return imagesUrl
    }

    async function downloadAllImages(content) {
        content.downloadedImages = []
        
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            const images = content.sentences[sentenceIndex].images

            for (let imageIndex = 0; imageIndex < images.length; imageIndex++ ) {
                const imageURL = images[imageIndex]

                try {
                    if (content.downloadedImages.includes(imageURL)) {
                        throw new Error('Imagem já foi baixada')
                    }

                    await downloadAndSave(imageURL, `${sentenceIndex}-original.png`)
                    content.downloadedImages.push(imageURL)
                    console.log(`> {${sentenceIndex}} {${imageIndex}} Baixou imagem com sucesso: ${imageURL}`)
                    break
                } catch(error) {
                    console.log(`> {${sentenceIndex}} {${imageIndex}} Erro ao baixar ${imageURL}: ${error}`)
                }
            }
        }
    }

    async function downloadAndSave(url, fileName) {
        return imageDownloader.image({
            url: url,
            dest: `./content/${fileName}`
        })
    }
}

module.exports = robot