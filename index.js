const fs = require('fs')
const path = require('path')
const jsdom = require("jsdom")
const HTMLtoDOCX = require('./htmlToDocx')

function lerArquivo() {
    const caminho = path.resolve(__dirname,'json','musicas.json')

    const file = fs.readFileSync(caminho, {encoding:'UTF8', flag:'r'})
    const json = JSON.parse(file)
    
    return json
}

function removerAcentos(string) {
    return string.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
}

function removerVerbo(string) {
    return string.replace(/\sé(\s|$)/g, ' ')
}

function formatarURL(string) {
    string = removerVerbo(string.toLowerCase())
    string = removerAcentos(string)
    string = string.replace(/[^-\w\s]/gi, '')
    string = string.replaceAll(' ','-')
    return string
}

const array = lerArquivo()

const resultado = array.map(async e => {
    const { nome, autor } = e
    const url = `https://www.cifraclub.com.br/${formatarURL(autor)}/${formatarURL(nome)}/`

    return await fetch(url).then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status);
        }
        return response.text();
    }).then(resposta => {
        let doc = new jsdom.JSDOM(resposta)
        const element = doc.window.document.querySelector("#js-w-content > div.g-1.g-fix.cifra > div.g-side-ad > div.cifra-container > div.cifra-column--left > div > div > pre")
        const titulo = doc.window.document.querySelector("#js-w-content > div.g-1.g-fix.cifra > div.g-side-ad > h1").outerHTML
        const autor = doc.window.document.querySelector("#js-w-content > div.g-1.g-fix.cifra > div.g-side-ad > h2").outerHTML
        const cifra = doc.window.document.querySelector("#js-w-content > div.g-1.g-fix.cifra > div.g-side-ad > div.cifra-container > div.cifra-column--left").outerHTML
        
        if (element) {
            console.log('Achou: ' + url)
            const html = titulo + autor + cifra
            return html
        }
    }).catch(err => {
        console.log(err + '\nUrl: ' + url)
    })
})

Promise.all(resultado).then(result => {
    HTMLtoDOCX.run(result)
})