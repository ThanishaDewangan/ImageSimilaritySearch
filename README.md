Image Similarity Search

A powerful AI-based image search engine that uses deep learning to find visually similar images. The application extracts feature vectors from images using TensorFlow.js and calculates similarity using cosine similarity between these vectors.

Features:

Upload images via drag-and-drop or file selection
Real-time similar image search using neural network features
View search history with previous queries
Grid and list view options for search results
Similarity score visualization for each match
Responsive design for desktop and mobile devices
Persistent storage using PostgreSQL database

Tech Stack:

Frontend: React, TypeScript, TanStack Query, ShadCN UI components
Backend: Node.js, Express
Database: PostgreSQL with Drizzle ORM
AI Model: TensorFlow.js MobileNet for feature extraction
Build Tools: Vite, ESBuild

Installation
Prerequisites
Node.js (v18+)
PostgreSQL database

Setup
Clone the repository:

git clone https://github.com/yourusername/ImageSimilaritySearch.git
cd image-similarity-search

Install dependencies:

npm install

Configure the database:

Create a PostgreSQL database
Create a .env file in the project root with:
DATABASE_URL=postgresql://username:password@localhost:5432/databasename

Push the database schema:

npm run db:push

Running the Application
Development Mode
npm run dev

For Windows Users
npm run dev:windows

Or create a dev:windows script in package.json:


"scripts": {
  "dev:windows": "set NODE_ENV=development && tsx server/index.ts"
}

Production Build

npm run build

npm start

How It Works

Image Upload: Users upload images via the frontend interface.

Feature Extraction: The backend processes the image through a pre-trained neural network (MobileNet) to extract a feature vector.

Similarity Calculation: When searching for similar images, the system calculates the cosine similarity between the query image's feature vector and all other images in the database.

Results Ranking: Images are ranked by similarity score and returned to the user.

API Endpoints

POST /api/images/upload - Upload a new image
GET /api/images/:id - Get a specific image
GET /api/images/:id/similar - Find similar images to a specific image
GET /api/history - Get search history
DELETE /api/history - Clear search history

Project Structure

├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and type definitions
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main App component
│   │   └── main.tsx       # Entry point
│   └── index.html         # HTML template
├── server/                # Backend Node.js application
│   ├── db.ts              # Database connection
│   ├── imageProcessor.ts  # TensorFlow image processing
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage interface
│   └── vite.ts            # Vite development server
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Database schema and types
└── various config files   # Configuration files

Troubleshooting

TensorFlow.js Installation Issues

If you encounter TensorFlow.js installation problems on Windows:

npm rebuild @tensorflow/tfjs-node --build-addon-from-source

Database Connection

If you experience database connection issues:

Verify PostgreSQL is running

Check your DATABASE_URL environment variable
Ensure your database exists and is accessible
