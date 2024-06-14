# Boba Shop API Documentation

## GET /menu

Retrieve a JSON collection of all categories and items served at the boba shop.

## Parameters 
category (required): The category of items to retrieve.

### Sample Request
GET /menu/tea

### Sample Response

```json
{
    "categories": [
        {
            "name": "Tea",
            "items": [
                {
                    "id": 1,
                    "name": "Green Tea",
                    "price": 3.99
                },
                {
                    "id": 2,
                    "name": "Black Tea",
                    "price": 4.49
                }
            ]
        },
        {
            "name": "Smoothies",
            "items": [
                {
                    "id": 3,
                    "name": "Strawberry Smoothie",
                    "price": 5.99
                },
                {
                    "id": 4,
                    "name": "Mango Smoothie",
                    "price": 6.49
                }
            ]
        }
    ]
}
