/*jshint sub:true*/
const {Given,When,Then} = require("@cucumber/cucumber");
const {camelCase} = require("lodash");
const {assert} = require("chai");
const {apir} = require("../../utilities/utils");
const url = require("../env/urls.json")
const env = require("../env/config.json")
const createPaymentReq = require("../page_objects/create_payment_request.json")
const failureCodes = require("../page_objects/failure_codes.json")
const channelConfig = require("../page_objects/channel_config.json")
const {faker} = require('@faker-js/faker');


// GIVEN STATEMENT 
Given(/^I created a "(.*)" request for "(.*) (.*)" request for endpoint "(.*)"$/, function (method, urlKey, locale, ep) {
    this.request = {
        "method": method,
        "host": url.urls[camelCase(urlKey)],
        "endpoint": ep,
        "auth": {
            "username": env[locale.toLowerCase()].api_key,
            "password": ""
        },
        "headers": {
            "Content-Type": "application/json"
        }
    };
});



Given(/^I created a "(.*)" "(.*) (.*)" request for endpoint "(.*)" that includes payment id$/, function (method, urlKey, locale, ep) {
    this.request = {
        "method": method,
        "host": url.urls[camelCase(urlKey)],
        "endpoint": ep + "/" + this.paymentCodeRes.id,
        "auth": {
            "username": env[locale.toLowerCase()].api_key,
            "password": ""
        },
        "headers": {
            "Content-Type": "application/json"
        }
    };
});


Given(/^key-values "(.*)": "(.*)" are present in the request headers$/, function (headerKey, headerValue) {
    let headerObj = {};
    headerObj[headerKey] = headerValue;
    this.request.headers = headerObj;
});

Given(/^I have updated the api key to this "(.*)"$/, function (userName) {
    this.request.auth = userName
});

Given(/^I have updated the payment id to this "(.*)"$/, function (paymentId) {
    Object.assign(this.request, { "endpoint": 
        paymentId
    });
});

Given(/^the request body was "(.*)"$/, function (bodyState) {
    switch (bodyState) {
        case "empty":
            this.reqBody = {};
            break;
        case "none":
            this.reqBody = null;
            break;
        default:
            this.reqBody = bodyState;
            break;
    }
});

// WHEN STATEMENT 
When(/^I send the request$/, async function () {
    if(this.request.method !== "GET"){
        this.request.requestBody = this.reqBody;
    }
    console.log(this.request)
    this.response = await apir(this.request);
    this.resBody = this.response.body;
});


When(/^I create a simulate payment request$/, async function () {
    this.reqBody = {
        "payment_code": this.paymentCodeRes.payment_code,
        "channel_code": this.paymentCodeRes.channel_code,
        "market": this.paymentCodeRes.market,
        "reference": this.paymentCodeRes.reference_id,
        "amount": this.paymentCodeRes.amount,
        "currency": this.paymentCodeRes.currency
    }
});

When(/^I added the requestBody.(.*) field with value "(.*)"$/, async function (key, value) {
    Object.assign(this.reqBody, {
        [key]: value
    })
});


When(/^I create a "(.*)" payment request$/, function (paymentType) {
    this.reqBody = Object.assign({}, createPaymentReq[`${paymentType}_payment`])
    Object.assign(this.reqBody, {
        "reference_id": faker.datatype.uuid()
    });

});


When(/^I create a "(.*)" payment request for channel "(.*)"$/, function (paymentType, channel_code) {
    this.reqBody = Object.assign({}, createPaymentReq[`${paymentType}_payment`][channel_code])
    Object.assign(this.reqBody, {
        "reference_id": faker.datatype.uuid()
    });

});

When(/^I copy the "(.*)" from the response.body$/, function (resKey) {
    Object.assign(this.reqBody, {
        [resKey]: this.resBody[resKey]
    })
});

When(/^the "(.*)" api key is set as "(.*)"$/, function (locale, apiKey) {
    Object.assign(this.request.auth, {
        "username": env[locale.toLowerCase()][apiKey]
    })
});


When(/^the requestBody.(.*) is "(.*)"$/, async function (reqKey, reqValue) {
    switch (reqValue) {
        case "blank":
            reqValue = "";
            break;
        case "null":
            reqValue = null;
            break;
        default:
            break;
    }

    switch (reqKey) {
        case "amount":
            reqValue = Number(reqValue);
            break;
        default:
            break;
    }
    this.reqBody[reqKey] = reqValue
});


// THEN STATEMENT 
Then(/^the response status should be "(.*)"$/, function (expectedStatus) {
    assert.strictEqual(this.response.statusCode, Number(expectedStatus), 'Incorrect Status code');
});

Then(/^the response.Body for "(.*)" should be returned$/, function (failureKey) {
    let actualResponse = this.resBody
    let expectedResponse = failureCodes[failureKey]


    assert.deepEqual(actualResponse, expectedResponse, 'Error messsage is incorrect')

});

Then(/^the response.Body for the "(.*)" containing "(.*)" should be returned$/, function (failureKey, dynamicValue) {
    switch (dynamicValue) {
        case "blank":
            dynamicValue = "";
            break;
        case "null":
            dynamicValue = null;
            break;
        default:
            break;
    }

    let actualResponse = this.resBody
    let expectedResponse = failureCodes[failureKey]

    let reg = new RegExp("{{(.*)}}")
    let errorMsg = expectedResponse.message
    if (errorMsg.match(reg)) {
        errorMsg = errorMsg.replace(errorMsg.match(reg)[0], dynamicValue)
        Object.assign(expectedResponse, {
            "message": errorMsg
        })
    }

    assert.deepEqual(actualResponse, expectedResponse, 'Error messsage is incorrect')

});


Then(/^the response.Body for the "(.*)" with amount of "(.*)" is returned$/, async function (failureKey, amountValue) {
    switch (amountValue) {
        case "blank":
            amountValue = "";
            break;
        case "null":
            amountValue = null;
            break;
        default:
            break;
    }

    let actualResponse = this.resBody
    let expectedResponse = Object.assign({}, failureCodes[failureKey])

    let amountWithCurrency = new Intl.NumberFormat('en-DE', {
        style: 'currency',
        currency: this.reqBody.currency
    }).format(amountValue)

    let amountReg = new RegExp("{{(.*)_amount}}")
    let invalidReg = new RegExp("{{invalidAmount}}")
    let errorMsg = expectedResponse.message
    if (errorMsg.match(amountReg)) {
        console.log(errorMsg.match(amountReg)[1])
        errorMsg = errorMsg.replace(errorMsg.match(amountReg)[0], channelConfig[this.reqBody.channel_code][errorMsg.match(amountReg)[1] + '_amount'])
        errorMsg = errorMsg.replace(errorMsg.match(invalidReg)[0], amountWithCurrency)
        Object.assign(expectedResponse, {
            "message": errorMsg
        })
    }
    assert.deepEqual(actualResponse, expectedResponse, 'Error messsage is incorrect')

});


Then(/^the response.Body for the "(.*)" with the count of  "(.*)" is returned$/, async function (failureKey, amountValue) {
    switch (amountValue) {
        case "blank":
            amountValue = "";
            break;
        case "null":
            amountValue = null;
            break;
        default:
            break;
    }

    let actualResponse = this.resBody
    let expectedResponse = Object.assign({}, failureCodes[failureKey])


    let amountReg = new RegExp("{{(.*)_limit}}")
    let invalidReg = new RegExp("{{invalidChar}}")
    let errorMsg = expectedResponse.message
    if (errorMsg.match(amountReg)) {
        console.log(errorMsg.match(amountReg)[1])
        errorMsg = errorMsg.replace(errorMsg.match(amountReg)[0], channelConfig[this.reqBody.channel_code][errorMsg.match(amountReg)[1] + '_limit'])
        errorMsg = errorMsg.replace(errorMsg.match(invalidReg)[0], amountValue)
        Object.assign(expectedResponse, {
            "message": errorMsg
        })
    }
    assert.deepEqual(actualResponse, expectedResponse, 'Error messsage is incorrect')

});



Then(/^the response.Body for the "(.*)" with the "(.*)" value is returned$/, async function (failureKey, reqKey) {

    let actualResponse = this.resBody
    let expectedResponse = Object.assign({}, failureCodes[failureKey])


    let keyReg = new RegExp("{{(.*)}}")
    let errorMsg = expectedResponse.message
    if (errorMsg.match(keyReg)) {
        console.log(errorMsg.match(keyReg)[1])
        errorMsg = errorMsg.replace(errorMsg.match(keyReg)[0], this.reqBody[errorMsg.match(keyReg)[1]])
        Object.assign(expectedResponse, {
            "message": errorMsg
        })
    }
    assert.deepEqual(actualResponse, expectedResponse, 'Response body not match')


});


Then(/^the expected response body with a status of "(.*)" should be returned$/, function (Status) {
    let actualResponse = this.resBody
    let expectedResponse = Object.assign({}, this.reqBody)

    let isSingleUse = false
    if (this.request.endpoint.includes("/payment_codes")) {
        isSingleUse = true
    }
    Object.assign(expectedResponse, {
        "business_id": env.ph.business_id,
        "is_single_use": isSingleUse,
        "status": Status,
        "description": 'description' in this.reqBody ? this.reqBody.description : null,
        "metadata": null
    })

    assert.deepInclude(actualResponse, expectedResponse, 'Response body not match')

    let dynamicKeys = ["id", "reference_id", "payment_code", "created_at", "updated_at", "expires_at"]
    assert.containsAllKeys(actualResponse, dynamicKeys)

});


Then(/^the expected simulation response body with the remarks of "(.*)" should be returned$/, function (remarks) {
    let actualResponse = this.resBody
    let expectedResponse = {
        "reference_id": this.paymentCodeRes.reference_id,
        "payment_code": this.paymentCodeRes.payment_code,
        "amount": this.paymentCodeRes.amount,
        "currency": this.paymentCodeRes.currency,
        "remarks": remarks
    }

    assert.deepInclude(actualResponse, expectedResponse, 'Response body not match')

    let dynamicKeys = ["id", "created"]
    assert.containsAllKeys(actualResponse, dynamicKeys)

});


Then(/^the response.Body for the "(.*)" with a channel of "(.*)" is returned$/, async function (failureKey, channelValue) {

    let actualResponse = this.resBody
    let expectedResponse = Object.assign({}, failureCodes[failureKey])


    let marketReg = new RegExp("{{(.*)_code}}")
    let invalidReg = new RegExp("{{invalidChannel}}")
    let errorMsg = expectedResponse.message
    if (errorMsg.match(marketReg)) {
        console.log(errorMsg.match(marketReg)[1])
        errorMsg = errorMsg.replace(errorMsg.match(marketReg)[0], this.reqBody[errorMsg.match(marketReg)[1]])
        errorMsg = errorMsg.replace(errorMsg.match(invalidReg)[0], channelValue)
        Object.assign(expectedResponse, {
            "message": errorMsg
        })
    }
    assert.deepEqual(actualResponse, expectedResponse, 'Error messsage is incorrect')

});



Then(/^the response.Body for the "(.*)" with out of range amount of "(.*)" is returned$/, async function (failureKey, amountValue) {
    switch (amountValue) {
        case "blank":
            amountValue = "";
            break;
        case "null":
            amountValue = null;
            break;
        default:
            break;
    }

    let actualResponse = this.resBody
    let expectedResponse = Object.assign({}, failureCodes[failureKey])

    let amountWithCurrency = new Intl.NumberFormat('en-DE', {
        style: 'currency',
        currency: this.reqBody.currency
    }).format(amountValue)

    let minamountReg = "{{minimum_amount}}"
    let maxamountReg = "{{maximum_amount}}"
    let invalidReg = "{{invalidAmount}}"
    let errorMsg = expectedResponse.message
    errorMsg = errorMsg.replace(minamountReg, channelConfig[this.reqBody.channel_code]["minimum_amount"])
    errorMsg = errorMsg.replace(maxamountReg, channelConfig[this.reqBody.channel_code]["maximum_amount"])
    errorMsg = errorMsg.replace(errorMsg.match(invalidReg)[0], amountWithCurrency)
    Object.assign(expectedResponse, {
        "message": errorMsg
    })
    assert.deepEqual(actualResponse, expectedResponse, 'Error messsage is incorrect')

});


Then(/^the same response body from the creation of payment codes should be received$/, function () {
    let actualResponse = this.resBody
    let expectedResponse = this.paymentCodeRes

    assert.deepEqual(actualResponse, expectedResponse, 'Response not match.')

});


Then(/^the same response body for the update payment codes with amount of "(.*)" should be received$/, function (amountValue) {
    let actualResponse = this.resBody
    let expectedResponse = this.paymentCodeRes

    Object.assign(expectedResponse, {"amount": Number(amountValue)})
    assert.deepEqual(actualResponse, expectedResponse, 'Amount not match.')

});