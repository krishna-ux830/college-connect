# College Connect

A modern social media platform designed specifically for IIIT Guwahati students and faculty members. This platform enables seamless communication, content sharing, and community engagement within the college ecosystem.

## 🌟 Features

- **Authentication & Authorization**
  - Secure login and registration system
  - Role-based access control (Student/Faculty)
  - IIIT Guwahati email domain validation (@iiitg.ac.in)

- **User Profiles**
  - Customizable profile pictures
  - Profile information management
  - Email and username updates
  - Role-specific features

- **Content Sharing**
  - Create and share posts
  - Upload images and media
  - Interactive polls
  - Like and comment functionality

- **Search & Discovery**
  - User search functionality
  - Profile discovery
  - Real-time search suggestions

- **Responsive Design**
  - Mobile-first approach
  - Modern UI with Tailwind CSS
  - Smooth user experience across devices

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Context API for state management
- Axios for API requests

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer for file uploads

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/4xush/college-connect.git
cd college-connect
```

2. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables
```bash
# In the server directory, create a .env file
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development servers
```bash
# Start backend server (from server directory)
npm run dev

# Start frontend server (from client directory)
npm run dev
```

## 📁 Project Structure

```
college-connect/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Context providers
│   │   ├── services/      # API services
│   │   └── styles/        # CSS styles
│   └── public/            # Static assets
│
└── server/                # Backend Node.js application
    ├── config/           # Configuration files
    ├── controllers/      # Route controllers
    ├── middleware/       # Custom middleware
    ├── models/          # Database models
    ├── routes/          # API routes
    └── uploads/         # File uploads directory
```

## 🔒 Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ayush Kumar** - *Initial work* - [GitHub](https://github.com/4xush)

## 🙏 Acknowledgments

- IIIT Guwahati for inspiration
- All contributors who have helped shape this project
- The open-source community for their valuable tools and libraries

## 📞 Support

For support, email ayush.kumar22b@iiitg.ac.in or create an issue in the repository.

---

Made with ❤️ for IIIT Guwahati 