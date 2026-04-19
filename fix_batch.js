const fs = require('fs');

let batch = fs.readFileSync('src/data/batch2.ts', 'utf8');

// Replace standard exports to make it loadable via eval
batch = batch.replace('export const batch2Designs =', 'module.exports =');

// Replace "peg_matrix": "10x10_something" with "peg_matrix": generateMatrix(10, 10)
const pattern = /"peg_matrix": "(\d+)x(\d+)_[^"]+"/g;

function generateMatrixStr(rows, cols) {
    const r = parseInt(rows, 10);
    const c = parseInt(cols, 10);
    const matrix = [];
    for(let i=0; i<r; i++) {
        const row = [];
        for(let j=0; j<c; j++) {
            // Checkerboard pattern or diagonal pattern based on size to make it look cool
            row.push((i+j)%4 === 0 || (i-j)%5 === 0 ? 1 : 0);
        }
        matrix.push(row);
    }
    return JSON.stringify(matrix);
}

batch = batch.replace(pattern, (match, r, c) => `"peg_matrix": ${generateMatrixStr(r, c)}`);

fs.writeFileSync('src/data/batch2.js', batch);
console.log("Created batch2.js");
