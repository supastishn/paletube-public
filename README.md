# SupaTube - YouTube Clone

A full-stack YouTube clone built with React, Express, and MongoDB.

## Features

- Video uploading and streaming
- Custom thumbnail uploads
- Video browsing and playback
- Search functionality
- Like videos
- View count tracking
- Responsive design

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **File Storage**: Local file system (uploads directory)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/supatube.git
   cd supatube
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   REACT_APP_PORT=3000
   MONGO_URI=mongodb://localhost:27017/supatube
   NODE_ENV=development
   ```

## Running the Application

### Development Mode

To run both the frontend and backend concurrently:

```
npm run dev
```

This will start:
- React frontend on http://localhost:3000
- Express backend on http://localhost:5000

### Running Frontend Only

```
npm start
```

### Running Backend Only

```
npm run server
```

## API Endpoints

- `GET /api/videos` - Get all videos
- `GET /api/videos/search` - Search videos by query
- `GET /api/videos/:id` - Get a specific video
- `POST /api/videos` - Upload a new video with optional thumbnail
- `PUT /api/videos/:id` - Update video details
- `DELETE /api/videos/:id` - Delete a video
- `POST /api/videos/:id/like` - Like a video

## Folder Structure

```
supatube/
├── public/              # Static files
├── server/              # Backend code
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded videos
│   │   └── thumbnails/  # Uploaded thumbnails
│   └── index.js         # Server entry point
├── src/                 # Frontend code
│   ├── components/      # React components
│   ├── config.js        # Configuration settings
│   ├── App.js           # Main React component
│   └── index.js         # Frontend entry point
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## Future Improvements

- User authentication and profiles
- Comments system
- Video categories and search
- Playlists
- Subscriptions
- Video recommendations

## License

GPL3
