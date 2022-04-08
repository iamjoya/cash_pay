
const report = require('multiple-cucumber-html-reporter');

report.generate({
    jsonDir: './reports',
    reportPath: './reports',
    openReportInBrowser: true,
    saveCollectedJSON: true,
    hideMetadata: true
});