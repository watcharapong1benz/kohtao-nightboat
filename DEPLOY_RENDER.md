# Deploying to Render

This project is configured for deployment on [Render](https://render.com).

## Prerequisites
1.  A GitHub account with this repository pushed to it.
2.  A Render account.

## Steps to Deploy

1.  **Push your code to GitHub**
    Ensure all your latest changes, including `render.yaml` and `render-build.sh`, are pushed to your repository.

2.  **Create a New Blueprint in Render**
    - Go to your Render Dashboard.
    - Click **"New"** -> **"Blueprint"**.
    - Connect your GitHub account if you haven't already.
    - Select your repository (`kohtao-nightboat`).
    - Render will automatically detect `render.yaml`.
    - Click **"Apply"**.

3.  **Wait for Deployment**
    - Render will:
        - Create a PostgreSQL database (`kohtao-db`).
        - Build your application using `render-build.sh`.
            - This installs dependencies for both server and client.
            - Builds the React client.
            - Generates the Prisma client.
        - Start the server using `cd server && npm start`.

## Important Notes

### Database Change
The `server/prisma/schema.prisma` file has been updated to use **PostgreSQL** instead of SQLite.
-   **On Render**: This is required and will work automatically with the managed database.
-   **Locally**: If you try to run the server locally now, it will look for a Postgres database.
    -   If you want to continue fetching local data, you may need to revert `provider = "postgresql"` back to `provider = "sqlite"` in `schema.prisma`.
    -   OR set up a local Postgres database and update your local `.env`.

### Environment Variables
The `render.yaml` automatically sets up:
-   `DATABASE_URL`: Connection string to the managed Postgres DB.
-   `SECRET_KEY`: A randomly generated secret for JWT.
-   `NODE_VERSION`: Set to 20.9.0.

### Initial Seeding
After the first deployment, your database will be empty. To add initial data (default admin user `admin`/`admin123`):
1.  Go to your service in the Render Dashboard.
2.  Click on the **"Shell"** tab.
3.  Run the following commands:
    ```bash
    cd server
    npm run seed
    ```

