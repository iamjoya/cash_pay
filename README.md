# cash_pay
 Cashpay work trial
 
 ## Setup instructions
1. Clone or Download the project file 
2. Open terminal and go to the package folder then run:
```
npm install
```
3. Run the ffg commands (Dependencies):

- [cucumber-js] : Execute BDD test
``` 
npm install --save-dev @cucumber/cucumber
``` 
- [Super Agent] : For API test
``` 
 npm install superagent
``` 
- [chai] : Assertions
``` 
npm install --save-dev chai
``` 
- [lodash] : to read camel case format
``` 
npm install --save-dev lodash
``` 
- [cucumber-html-reporter] : Generate Reports
``` 
npm install multiple-cucumber-html-reporter --save
``` 
- [rimraf] : Delete existing reports
``` 
npm install rimraf
``` 
- [faker] : To generate for random test data
``` 
npm install --save-dev @faker-js/faker
``` 

## Pre-requisite:
- On the feature > env > config.json add the following parameter with the correct test data value from your xendit dashboard account:
``` 
{    
    "api_key": "",
    "business_id": "", 
    "no_write_access_api_key": ""
}
``` 

## To Create Reports folder
```
npm run initialize_report
```

## Test Execution (Cebuana)
```
npm run test:cebuana
```

This will clean up all previous reports, execute all feature files for cebuana, generate reports, and opens a new browser tab for the HTML report.

