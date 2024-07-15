const path = require('path');
const { execSync } = require('child_process');

const semanticUiPath = path.resolve(__dirname, '../node_modules/semantic-ui-css');
const semanticUiCssFile = path.join(semanticUiPath, 'semantic.min.css');
const outputCssFile = path.join(semanticUiPath, 'semantic.namespaced.min.css');

// Run PostCSS with postcss-prefixer
execSync(`postcss --verbose ${semanticUiCssFile} -o ${outputCssFile}`);

console.log('Semantic UI CSS has been namespaced successfully.');