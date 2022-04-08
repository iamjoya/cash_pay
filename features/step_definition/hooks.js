const { Before, After } = require("@cucumber/cucumber");

let previousPaymentCodeRes= '';

After({ tags: "@create_payment_code" }, function () {
    previousPaymentCodeRes = this.resBody
});

Before(function () {
    this.paymentCodeRes = previousPaymentCodeRes
});