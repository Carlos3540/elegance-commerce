import { DEPARTAMENTOS } from './src/data/divipola.ts';

const codes = new Set();
const duplicates = [];

for (const depto of DEPARTAMENTOS) {
  for (const muni of depto.municipios) {
    if (codes.has(muni.code)) {
      duplicates.push(`${muni.code} (${muni.name}) in ${depto.name}`);
    }
    codes.add(muni.code);
  }
}

if (duplicates.length > 0) {
  console.log('Duplicate codes found:');
  console.log(duplicates.join('\n'));
} else {
  console.log('No duplicate codes found.');
}
