# Quick API Test with cURL

This file is for quickly testing API endpoints using cURL, bypassing the Jest test environment.

## Create Order

1.  **Login to get a token:**

    ```bash
    curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
        "username": "admin",
        "password": "admin123"
    }'
    ```

2.  **Copy the `accessToken` from the response.**

3.  **Create a new order:**

    Replace `YOUR_TOKEN_HERE` with the actual token.

    ```bash
    curl -X POST http://localhost:3000/api/orders \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -d '{
        "typeOrder": "standard",
        "nameOrder": "cURL Test Order",
        "clientId": "a1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "note": "Test order created by cURL",
        "sections": [
            {
                "sectionName": "Test Section from cURL",
                "items": [
                    {
                        "productId": "a1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c7",
                        "quantity": 5,
                        "length": 200,
                        "width": 300
                    }
                ]
            }
        ]
    }'
    ```

If this request returns a `201 Created` status, the problem is likely within the Jest/supertest environment. If it returns `400 Bad Request`, the problem is in the application code (likely validation).
