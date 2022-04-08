Feature: Cebunana - Get Payment Code by ID

    @create_payment_code
    Scenario Outline: Scenario Outline name: Be able to create payment code
        Given I created a "POST" request for "Xendit PH" request for endpoint "/payment_codes"
        When I create a "fixed" payment request for channel "CEBUANA"
        And the requestBody.amount is "<amount>"
        And I send the request
        Then the response status should be "201"
        And the expected response body with a status of "ACTIVE" should be returned

        Examples:
            | amount |
            | 120    |

    @negative_scenario
    Scenario Outline: 404 status code - Validation should prompt when payment code not exist or not found
        Given I created a "GET" "Xendit PH" request for endpoint "/payment_codes" that includes payment id
        And I have updated the payment id to this "/payment_codes/<payment_code_id>"
        When I send the request
        Then the response status should be "404"

        Examples:
            | payment_code_id                            |
            | TESTREPCA8NJCHINVALID                      |
            | pcode-bfdc6037-574b-41e8-8a21-948fa5e7b0c4 |

    @positive_scenario
    Scenario: Be able to get the response body from the payment code creation
        Given I created a "GET" "Xendit PH" request for endpoint "/payment_codes" that includes payment id
        When I send the request
        Then the response status should be "200"
        And the same response body from the creation of payment codes should be received


    @positive_scenario
    Scenario Outline: Be able to update valid amount range
        Given I created a "PATCH" "Xendit PH" request for endpoint "/payment_codes" that includes payment id
        And the request body was "empty"
        When the requestBody.amount is "<amount>"
        And the requestBody.currency is "<currency>"
        And I send the request
        Then the response status should be "200"


        Examples:
            | amount | currency |
            | 150    | PHP      |


    @positive_scenario
    Scenario Outline: Be able to get the updated amount
        Given I created a "GET" "Xendit PH" request for endpoint "/payment_codes" that includes payment id
        When I send the request
        Then the response status should be "200"
        And the same response body for the update payment codes with amount of "<amount>" should be received


        Examples:
            | amount |
            | 150    |







