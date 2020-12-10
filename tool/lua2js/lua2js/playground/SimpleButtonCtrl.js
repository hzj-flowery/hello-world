const codegen = require('esotope');

let node = {
    type: 'script',
    body: [
        
    ]
}

var code = codegen.generate({
    type: 'ClassDeclaration',
    id: {
        type: 'Identifier',
        name: 'Button'
    },
    superClass: {

        type: 'Identifier',
        name: 'Father'
    },
    body: {
        type: 'ClassBody',
        body:[]
    }
})

console.log(code);