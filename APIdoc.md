# Boba Shop Backend API Documentation

This API serves data related to a Boba Shop, including menu items, categories, customizations, and reviews.

## Base URL

The base URL for all endpoints is `http://localhost:3000`.

## Error Handling

This API handles errors with appropriate status codes and error messages.

- **400 Bad Request:** Invalid or missing request parameters.
- **404 Not Found:** Resource or endpoint not found.
- **500 Internal Server Error:** Server-side error occurred.

## Endpoints

### Get Menu Data

- **URL:** `/menu`
- **Method:** GET
- **Description:** Retrieves a JSON collection of all categories and items served at the boba shop.
- **Response:** Returns an array of menu categories and items.
- **Sample Response:**
  ```json
  [
    {
      "category": "Milk Tea",
      "items": [
        {
          "id": 1,
          "name": "Hokkaido Milk Tea",
          "price": 5.5,
          "image": "/imgs/hokkaido-milk-tea.jpg"
        },
        {
          "id": 2,
          "name": "Coffee Milk Tea",
          "price": 5.5,
          "image": "/imgs/coffee-milk-tea.jpg"
        },
        ...
        {
          "id": 12,
          "name": "Honeydew Milk Tea",
          "price": 3.25,
          "image": "/imgs/honeydew-milk-tea.jpg"
        }
      ]
    }
  ]

### Get Items by Category

- **URL:** `/menu/:category`
- **Method:** GET
- **Description:** Retrieves a JSON array of items for the specified category.
- **Parameters:**
  - `category`: Name of the menu category (e.g., `Milk Tea`).
- **Response:** Returns an array of items for the specified category.
- **Sample Response:**
  ```json
  [
    {
      "id": 1,
      "name": "Hokkaido Milk Tea",
      "price": 5.5,
      "image": "/imgs/hokkaido-milk-tea.jpg"
    },
    {
      "id": 2,
      "name": "Coffee Milk Tea",
      "price": 5.5,
      "image": "/imgs/coffee-milk-tea.jpg"
    },
    ...
    {
      "id": 12,
      "name": "Honeydew Milk Tea",
      "price": 3.25,
      "image": "/imgs/honeydew-milk-tea.jpg"
    }
  ]

### Post Reviews

- **URL:** `/reviews`
- **Method:** POST
- **Description:** Adds a new review for the bobashop visit
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "rating": 4,
    "comment": "Delicious drink, loved the flavor!"
  }
