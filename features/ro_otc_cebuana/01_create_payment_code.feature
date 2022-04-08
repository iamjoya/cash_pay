Feature: Cebunana - Create Payment Code

    Background:
        Given I created a "POST" request for "Xendit PH" request for endpoint "/payment_codes"

    @negative_scenario
    Scenario Outline: 404 status - Validation should prompt when Retail outlet merchant not found.
        When I create a "fixed" payment request for channel "CEBUANA"
        And the requestBody.channel_code is "<invalid_channel_code>"
        And I send the request
        Then the response status should be "400"
        And the response.Body for "invalid_channel" should be returned

        Examples:
            | invalid_channel_code |
            | ceb                  |
            | buana                |
            | cén                  |
            | CEBuANA              |
            | 7éLEVEN              |


    @negative_scenario
    Scenario Outline: 404 status - Validation should prompt expiration date is not in the future date
        When I create a "fixed" payment request for channel "CEBUANA"
        And I added the requestBody.expires_at field with value "<backdated_expiry_date>"
        And I send the request
        Then the response status should be "400"
        And the response.Body for "back_dated_expiry_is_invalid" should be returned

        Examples:
            | backdated_expiry_date      |
            | 2022-04-01T23:03:08.97725Z |


    @negative_scenario 
    Scenario Outline: 400 status - Validation should be apply when channel code is not supported
        When I create a "fixed" payment request for channel "CEBUANA"
        And the requestBody.channel_code is "<channel_code>"
        And I send the request
        Then the response status should be "400"
        And the response.Body for the "unsupported_channel" with a channel of "<channel_code>" is returned

        Examples:
            | channel_code |
            | CEBUANAS     |


    @negative_scenario
    Scenario: 400 status - Validation should prompt when request body is not a valid JSON format.
        And the request body was "invalid json format"
        When I send the request
        Then the response status should be "400"
        And the response.Body for "invalid_json" should be returned

    @negative_scenario
    Scenario: 401 Unauthorised status error should prompt when authorisation is not valid
        And I have updated the api key to this "invalidAPIKEY"
        When I create a "fixed" payment request for channel "CEBUANA"
        And I send the request
        Then the response status should be "401"
        And the response.Body for "invalid_api_key" should be returned

    @negative_scenario
    Scenario: Validation should prompt when i leave Channel Code field empty
        When I create a "fixed" payment request for channel "CEBUANA"
        And the requestBody.channel_code is "blank"
        And I send the request
        Then the response status should be "400"
        And the response.Body for "missing_channel_code" should be returned

    @negative_scenario
    Scenario: Validation should prompt when i leave Country field field empty
        When I create a "fixed" payment request for channel "CEBUANA"
        And the requestBody.channel_code is "CEBUANA"
        And the requestBody.market is "blank"
        And I send the request
        Then the response status should be "400"
        And the response.Body for the "unknown_country" containing "blank" should be returned

    @negative_scenario
    Scenario: Validation should prompt when i leave Currency field field empty
        When I create a "fixed" payment request for channel "CEBUANA"
        And the requestBody.channel_code is "CEBUANA"
        And the requestBody.currency is "blank"
        And I send the request
        Then the response status should be "400"
        And the response.Body for the "unknown_currency" containing "blank" should be returned

    @negative_scenario
    Scenario: Validation should prompt when i leave Reference ID field empty
        When I create a "fixed" payment request for channel "CEBUANA"
        And the requestBody.reference_id is "blank"
        And I send the request
        Then the response status should be "400"
        And the response.Body for "missing_reference_id" should be returned

    @negative_scenario
    Scenario: Validation should prompt when i leave Customer Name field empty
        When I create a "fixed" payment request for channel "CEBUANA"
        And the requestBody.customer_name is "blank"
        And I send the request
        Then the response status should be "400"
        And the response.Body for "missing_customer_name" should be returned


    @negative_scenario
    Scenario: Validation should prompt when customer name contains diacritics
        When I create a "fixed" payment request for channel "CEBUANA"
        And the requestBody.customer_name is "JOHN DOÈ "
        And I send the request
        Then the response status should be "400"
        And the response.Body for "diacritics_not_supported" should be returned


    @negative_scenario
    Scenario Outline: Validation should prompt when Customer Character Limit exceeded the maximum limit
        When I create a "fixed" payment request for channel "CEBUANA"
        And the requestBody.customer_name is "<customer_name>"
        And I send the request
        Then the response status should be "400"
        Then the response.Body for the "customer_name_limit_exceeded" with the count of  "<totalCount>" is returned


        Examples:
            | customer_name                                                                                                                                                                                                                                                                                 | totalCount |
            | Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries | 285        |


    @negative_scenario
    Scenario Outline: Validation should prompt when amount is below the minimum limit of Php 1
        When I create a "fixed" payment request for channel "CEBUANA"
        And the requestBody.amount is "<amount>"
        And I send the request
        Then the response status should be "400"
        Then the response.Body for the "amount_below_minimum" with amount of "<amount>" is returned


        Examples:
            | amount |
            | 0      |
            | -9     |

    @negative_scenario
    Scenario Outline: Validation should prompt when amount is above the maximum limit of Php 50,000
        When I create a "fixed" payment request for channel "CEBUANA"
        And the requestBody.amount is "<amount>"
        And I send the request
        Then the response status should be "400"
        Then the response.Body for the "amount_above_maximum" with amount of "<amount>" is returned


        Examples:
            | amount |
            | 50999  |
            | 65000  |

    @negative_scenario
    Scenario: DUPLICATE ERROR should prompt when payment code already exist
        When I create a "fixed" payment request for channel "CEBUANA"
        And I send the request
        And I create a "fixed" payment request for channel "CEBUANA"
        And I copy the "reference_id" from the response.body
        And I send the request
        Then the response status should be "409"
        Then the response.Body for the "duplicate_payment_code" with the "reference_id" value is returned


    @positive_scenario
    Scenario: Be able to create payment code
        When I create a "fixed" payment request for channel "CEBUANA"
        And I send the request
        Then the response status should be "201"
        And the expected response body with a status of "ACTIVE" should be returned
