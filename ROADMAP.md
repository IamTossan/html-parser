[ ] write a proper html parser / remove html2json dependency
[ ] unit testing
[ ] more command lines feat like --verbose
[ ] improve time complexity
[ ] make scrapper more flexible to input structure changes
[ ] add more flexibility to searching / traversing
[ ] add more CSS-like selection features to parser

### notes

The actual parser doesn't look maintained,
also, the output is a bit dirty because there is a lot of:
```
{
    node: 'text',
    text: '  \n  ',
}
```
