Feature: 7ELEVEN - Simulate Payment

    @create_payment_code @positive_scenario
    Scenario: Be able to create payment code
        Given I created a "POST" request for "Xendit PH" request for endpoint "/payment_codes"
        When I create a "fixed" payment request for channel "CEBUANA"
        And I send the request
        Then the response status should be "201"
        And the expected response body with a status of "ACTIVE" should be returned


    @negative_scenario
    Scenario Outline: Validation should prompt when i pay amount not equal to the exact amount from the payment code creation
        Given I created a "POST" request for "Xendit PH" request for endpoint "/payment_codes/simulate_payment"
        When I create a simulate payment request
        And the requestBody.amount is "<amount>"
        And I send the request
        Then the response status should be "400"


        Examples:
            | amount |
            | 150    |
            | -9     |


    @positive_scenario
    Scenario: Be able to simulate payment
        Given I created a "POST" request for "Xendit PH" request for endpoint "/payment_codes/simulate_payment"
        When I create a simulate payment request
        And I send the request
        Then the response status should be "200"
        And the expected simulation response body with the remarks of "payment simulation" should be returned


