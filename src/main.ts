import * as fs from 'fs';
import { SncfScrapper } from './scrappers/Sncf.scrapper';

if (process.argv.length < 3) {
    console.log('usage: node main.js <html file> <optionnal output file>');
    process.exit();
}

const htmlFile = process.argv[2];
const outputFile = process.argv[3] || htmlFile.replace(/\.html$/, '') + '.json';

fs.readFile(htmlFile, (err, data) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const sncfParser = new SncfScrapper(data);
    const parsedData = sncfParser.getExtractedData();
    const outputJson = JSON.stringify(
        {
            status: 'ok',
            result: parsedData,
        },
        null,
        2,
    )

    fs.writeFile(outputFile, outputJson, (err) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log('data output in file:', outputFile);
    })

});