const {copyImage} = require('./compress/image');
const {minifyJson} = require('./compress/json');

const {join} = require('path');

const commander = require('commander')

commander.version(require('./package.json').version)

commander.option('-p, --project <dir>', 'project path', process.cwd())
         .option('-o, --output <dir>', 'output directory', join(process.cwd(), 'dist'))

commander.parse(process.argv)

const project = commander.project;
const dest = commander.output;

compress(project, dest);

async function compress(project, dest) {
    await copyImage(project, dest);
    await minifyJson(project, dest);
}
