const scanner = require('sonarqube-scanner');
import runConfigLoader from './helpers/ConfigLoader'

runConfigLoader();

scanner({
    serverUrl: 'http://127.0.0.1:80/',
    token: process.env.SONARQUBE_TOKEN,
    options: {
        'sonar.projectName': 'backend',
        'sonar.projectDescription': 'CyberDoc Backend project',
        'sonar.sources': 'src',
        'sonar.tests': 'tests'
    }
}, () => process.exit())