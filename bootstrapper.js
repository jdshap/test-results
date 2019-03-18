const app = require('./app');
const fs = require('fs');

const argv = require('yargs')
    .default('c', './config.json')
    .alias('c', 'config-path')
    .describe('c', 'Set path to config file')
    .usage('Usage: $0 -c [str]')
    .help('h')
    .alias('h', 'help')
    .argv;

const configPath = './config.json';

const configTemplate = `{
    "contextPath": "",
    "port": "",
    "databasePath": "",
    "databaseName": ""
}`;

if(!fs.existsSync(configPath)) fs.writeFileSync('config.json', configTemplate, 'utf8');
const config = require(configPath);

app.startserver(config);