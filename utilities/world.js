const { setWorldConstructor, setDefaultTimeout } = require("@cucumber/cucumber");

function setupEnvironment({ attach, parameters }) {
    this.attach = attach;
    this.parameters = parameters;
}

setDefaultTimeout(50000);
setWorldConstructor(setupEnvironment);