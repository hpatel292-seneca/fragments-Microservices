## Cloud Computing for Programmers(CCP555)

## fragments

This document specifies the API for the Fragments Microservice, a cloud-based microservice developed for a fictional Canadian manufacturing company. The Fragments Microservice is designed to store and manage small fragments of text and images, which are used across various systems including IoT devices, mobile apps, and automated cameras.

## API Routes

### 1. /

#### GET /

- Description: Health check route.
- Response: Status, Author, Github Repo URL and Version.

### 2. /v1/Fragments

#### POST /v1/Fragments

- Description: Creates a new fragment.
- Request Body: Raw binary data.
- Headers: Content-Type specifying the fragment type.
- Response: HTTP 201 with fragment metadata.

#### GET /v1/fragments

- Description: Retrieves IDs of all fragments owned by the user.
- Response: HTTP 200 with an array of fragment IDs

#### GET /v1/fragments?expand=1

Description: Retrieves detailed metadata of all fragments owned by the user.
Response: HTTP 200 with an array of fragment metadata.

### 3. /v1/fragments/:id

#### GET /v1/fragments/:id

- Description: Retrieves fragment data.
- Response: HTTP 200 with fragment data.

#### GET /v1/fragments/:id .html, .txt, .md

- Description: Retrieves fragment data in a specified format.
- Response: HTTP 200 with converted fragment data.

## Package.json Scripts

- `npm start`: Start the server.
- `npm run lint`: Lint code using ESLint on .js files stored under src folder.
- `npm run dev`: Start the server in development mode with debug logs enabled.
- `npm run debug`: Start the server in debug mode for remote debugging with a debugger attached.
- `npm run test:watch`: Runs Jest in watch mode with a specific configuration file.
- `npm run test`: Runs Jest tests with a specific configuration file.
- `npm run coverage`: Runs Jest to generate test coverage reports.

## Usage

You can use tools like Postman or curl to interact with the API endpoints.
