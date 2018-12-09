// @ts-ignore: html2json has no type definition
import { html2json } from 'html2json';
import { filter, get, isArray } from 'lodash';

export class Parser {

    file: object;

    constructor(rawhtml: string) {
        this.file = html2json(rawhtml);
    }

    getNodeBySelector(selector: string) {

        let tags: string[] = selector.split(' ');

        let selections: object[] = [this.file];

        while(tags.length) {
            const tag = tags.shift();
            let filtered: object[] = [];

            selections.forEach((selection) => {
                const f = filter(selection['child'], { node: 'element', tag });
                if (f.length) {
                    filtered = [
                        ...filtered,
                        ...f,
                    ];
                }
            });

            if (!filtered.length) {
                return null;
            }
            selections = filtered;
        }

        return selections;
    }

    filterByAttribute(nodes: object[], attrName: string, attrValue: string) {
        let v = [];

        nodes.forEach((el) => {
            const attr: string|string[] = get(el, ['attr', attrName], false);

            if (attr === attrValue) {
                v.push(el['child']);
            } else if(isArray(attr) && attr.indexOf(attrValue) !== -1) {
                v.push(el['child']);
            }
        });

        return v;
    }
}