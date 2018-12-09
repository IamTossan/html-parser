import { Parser } from '../shared/Parser';
import * as moment from 'moment';

export class SncfScrapper {

    parser: Parser;

    constructor(rawhtml: Buffer) {
        this.parser = new Parser(this.sanitizeRawHtml(rawhtml));
    }

    sanitizeRawHtml(rawhtml: Buffer): string {
        return rawhtml.toString()
            .replace(/\\r\\n\s*/g, '\n')
            .replace(/\s*\n/g, '\n')
            .replace(/\s\\"\s/g, ' ')
            .replace(/\\"/g, '"');
    }

    getTripMetadata() {
        const c = this.parser.getNodeBySelector('html body div table tbody tr td table tbody tr td table tbody tr td span')
            .map((el) => {
                return el['child'][0];
            });

        const code = c[16].text.trim();
        const name = c[17].text.trim();

        return {
            code,
            name,
        };
    }

    getCustomPrices() {
        const prices = [
            ...this.parser.filterByAttribute(
                this.parser.getNodeBySelector('html body div table tbody tr td table tbody tr td table tbody tr td'),
                'align',
                'right'
            ).slice(0, -1),
            ...this.parser.filterByAttribute(
                this.parser.getNodeBySelector('html body div table tbody tr td table tbody tr td div div table tbody tr td'),
                'align',
                'right'
            ),
        ];


        return prices
            .filter((custom) => {
                return custom[0].text.indexOf('€') !== -1;
            })
            .map((custom) => {
                return {
                    value: parseFloat(custom[0].text.replace(/€/, '').replace(/,/, '.').trim()),
                };
            });
    }

    getTripsPrice() {
        const priceNode = this.parser.filterByAttribute(
            this.parser.getNodeBySelector('html body div table tbody tr td table tbody tr td table tbody tr td'),
            'align',
            'right'
        ).pop()[0];

        return parseFloat(priceNode.text.replace(/€/, '').replace(/,/, '.').trim());
    }

    getTrainDates() {
        const dateNodes = this.parser.filterByAttribute(
            this.parser.getNodeBySelector('html body div table tbody tr td table tbody tr td div table tbody tr td'),
            'class',
            'pnr-summary'
        );

        let dates = [];
        dateNodes.forEach((node) => {
            const text = node[0].text;
            dates = dates.concat(text.match(/\d{2}\/\d{2}\/\d{4}/g));
        })
        return dates.map((date) => {
            return moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD HH:mm:ss.sss') + 'Z';
        });
    }

    getTrainDetails(node) {
        const travelWay = this.parser.filterByAttribute(node.child[1].child, 'class', 'travel-way')[0][0].text.trim();
        const departureTime = this.parser.filterByAttribute(node.child[1].child, 'class', 'origin-destination-hour')[0][0].text.trim();
        const departureStation = this.parser.filterByAttribute(node.child[1].child, 'class', 'origin-destination-station')[0][0].text.trim();
        const type = this.parser.filterByAttribute(node.child[1].child, 'align', 'center')[1][0].text.trim();
        const number = this.parser.filterByAttribute(node.child[1].child, 'align', 'center')[2][0].text.trim();
        const arrivalTime = this.parser.filterByAttribute(node.child[3].child, 'class', 'origin-destination-hour')[0][0].text.trim();
        const arrivalStation = this.parser.filterByAttribute(node.child[3].child, 'class', 'origin-destination-station')[0][0].text.trim();

        return {
            type: travelWay,
            trains: [
                {
                    departureTime,
                    departureStation,
                    arrivalTime,
                    arrivalStation,
                    type,
                    number,
                }
            ]
        }
    }

    getTripsDetails() {

        const tripDetailsNodes = this.parser.filterByAttribute(
            this.parser.getNodeBySelector('html body div table tbody tr td table tbody tr td table'),
            'class',
            'product-details'
        );

        const trainDates = this.getTrainDates();

        return tripDetailsNodes.map((node, idx) => {
            return {
                ...this.getTrainDetails(node[1]),
                date: trainDates[idx],
            };
        });
    }

    getExtractedData() {
        return {
            trips: [
                {
                    ...this.getTripMetadata(),
                    details: {
                        price: this.getTripsPrice(),
                        roundTrips: this.getTripsDetails(),
                    },
                },
            ],
            custom: {
                prices: this.getCustomPrices(),
            }
        }
    }

}