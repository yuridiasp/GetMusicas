const path = require('path')
const fs = require('fs')
const HTMLtoDOCX = require('html-to-docx')

async function run (lista) {
    console.log(lista[0])

    let concluido = null
    const date = new Date
    
    let result = [], promises = []
    console.log('Inicializado variaveis...')
    
    const documentOptions = {
        margin: {top: 250, right: 250, bottom: 250, left: 250},
        table: {row: {cantSplit: false}},
        pageNumber: true,
        decodeUnicode: true
    }

    if (lista.length > 0) {
        let obj = {fileName: `MUSIC ${date.getDate()}${date.getMonth()+1 < 10 ? "0" + (date.getMonth()+1) : date.getMonth()+1}${date.getFullYear()}`, fileBuffer: HTMLtoDOCX(lista, null, documentOptions)}
        result.push(obj)
        promises.push(obj.fileBuffer)
        console.log(`Iniciando criacao do documento docx ${obj.fileName}`)
    }

    const results = await Promise.all(
        result.map(async (obj) => ({
            ...obj,
            result: await obj.fileBuffer
        }))
    )
    
    results.forEach(e => {
        const filePath = path.resolve(__dirname, e.fileName +'.docx')
        console.log(`Iniciando escrita do arquivo ${e.fileName} no caminho ${filePath}`)
        fs.writeFile(filePath, e.result, (error) => {
            if (error) {
                console.log('File ' + e.fileName +'.docx creation failed')
                console.log("Erro:" + error)
            }
            console.log('File ' + e.fileName +'.docx created successfully')
            concluido = true
        })
    })
    return concluido, results
}

module.exports = {
    run
}