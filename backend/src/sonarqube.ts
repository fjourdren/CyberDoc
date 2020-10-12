const scanner = require('sonarqube-scanner');
import runConfigLoader from './helpers/ConfigLoader'

runConfigLoader();

scanner({
    serverUrl: 'http://sonarqube.fulgen.fr',
    token: process.env.SONARQUBE_TOKEN,
    options: {
        'sonar.projectName': 'CyberDoc-Backend',
        'sonar.projectDescription': 'CyberDoc Backend project',
        'sonar.sources': 'dist',
        'sonar.tests': 'tests'
    }
}, () => process.exit())