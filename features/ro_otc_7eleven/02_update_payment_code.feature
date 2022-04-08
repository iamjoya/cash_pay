Feature: 7ELEVEN - Update Payment Code by ID

    @create_payment_code @positive_scenario
    Scenario: Be able to create payment code
        Given I created a "POST" request for "Xendit PH" request for endpoint "/payment_codes"
        When I create a "fixed" payment request for channel "7ELEVEN"
        And I send the request
        Then the response status should be "201"
        And the expected response body with a status of "ACTIVE" should be returned


    @positive_scenario
    Scenario Outline: Validation should be apply when try to update amount
        Given I created a "PATCH" "Xendit PH" request for endpoint "/payment_codes" that includes payment id
        And the request body was "empty"
        And the requestBody.channel_code is "7ELEVEN"
        When the requestBody.amount is "<amount>"
        And the requestBody.currency is "<currency>"
        And I send the request
        Then the response status should be "400"
        And the response.Body for "change_amount_not_supported" should be returned


        Examples:
            | amount | currency |
            | 200    | PHP      |


    @positive_scenario
    Scenario Outline: Be able to update payment code description
        Given I created a "PATCH" "Xendit PH" request for endpoint "/payment_codes" that includes payment id
        And the request body was "empty"
        When the requestBody.description is "<description>"
        And I send the request
        Then the response status should be "200"
        And the expected response body with a status of "ACTIVE" should be returned

        Examples:
            | description |
            | Testing     |

    @negative_scenario
    Scenario: API key access permission is set as read only
        Given I created a "PATCH" "Xendit PH" request for endpoint "/payment_codes" that includes payment id
        And the "PH" api key is set as "no_write_access_api_key"
        When I send the request
        Then the response status should be "403"
        And the response.Body for "access_permission_denied" should be returned


    @negative_scenario
    Scenario: 401 Unauthorised status error should prompt when secret key is not valid
        Given I created a "PATCH" "Xendit PH" request for endpoint "/payment_codes" that includes payment id
        And the request body was "invalid json format"
        When I send the request
        Then the response status should be "400"
        And the response.Body for "invalid_json" should be returned



    @positive_scenario
    Scenario Outline: Payment code status should be EXPIRED when expires at is not equal to the date today
        Given I created a "PATCH" "Xendit PH" request for endpoint "/payment_codes" that includes payment id
        And the request body was "empty"
        And the requestBody.description is "<description>"
        And I send the request
        Then the response status should be "200"
        And the expected response body with a status of "ACTIVE" should be returned

        Examples:
            | description |
            | Testing     |


    @negative_scenario
    Scenario Outline: Validation should be apply when description 250 character limit exceeded
        Given I created a "PATCH" "Xendit PH" request for endpoint "/payment_codes" that includes payment id
        And the request body was "empty"
        And the requestBody.channel_code is "7ELEVEN"
        And the requestBody.description is "<description>"
        And I send the request
        Then the response status should be "400"
        Then the response.Body for the "description_limit_exceeded" with the count of  "<totalCount>" is returned

        Examples:
            | description                                                                                                                                                                                                                                                         | totalCount |
            | Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s when an unknown printer took a galley of type and scrambled it to make a type specimen book It has survived | 259        |

    @negative_scenario
    Scenario Outline: Validation should prompt when updating customer name
        Given I created a "PATCH" "Xendit PH" request for endpoint "/payment_codes" that includes payment id
        And the request body was "empty"
        When the requestBody.customer_name is "<customer_name>"
        And I send the request
        Then the response status should be "400"
        And the response.Body for "change_7eleven_payer_not_supported" should be returned

        Examples:
            | customer_name      |
            | Joy Aguilar Update |