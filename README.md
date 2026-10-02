ParkEra — Smart Parking Management System
🚗 About ParkEra

ParkEra is a smart parking management platform designed to make parking easier, faster, and more organized.

It allows users to find nearby parking spaces, view available slots, book a slot, manage their vehicle and parking duration, and receive automated notifications.

The system follows a First-Come, First-Served (FCFS) approach for slot allocation and includes an admin panel for managing parking slots, bookings, users, and penalties.

✨ Features
👤 User Features
🔐 OTP-based user registration and authentication
📍 Location-based nearby parking search
🅿️ Real-time parking slot availability
🚗 Vehicle selection — Car, Bike, Scooty
📅 Parking slot booking
⏱️ Parking duration selection
💳 Parking payment flow
📧 Automated email notifications
🔔 Parking expiry reminders
⚠️ Automatic late-parking penalty calculation
🎫 Parking passes for frequent users
🛠️ Admin Features
Admin dashboard
User management
Parking slot management
Booking management
Parking availability monitoring
Penalty management
Pass management
🧠 How ParkEra Works
User
  ↓
Select Location
  ↓
Find Nearby Parking
  ↓
Check Available Slots
  ↓
Select Vehicle + Duration
  ↓
Book Parking Slot
  ↓
Receive Confirmation
  ↓
Parking Reminder
  ↓
Parking Time Expires
  ↓
Penalty Applied if Overstayed
🏗️ System Architecture
              ┌─────────────────┐
              │     React UI    │
              │   Vite + TSX    │
              └────────┬────────┘
                       │
                       ↓
              ┌─────────────────┐
              │ Node.js +       │
              │ Express API     │
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
     MongoDB Atlas   Nodemailer   Google Maps
💻 Tech Stack
Technology	Purpose
React	Frontend
Vite	Frontend development/build
TypeScript / TSX	Application development
Tailwind CSS	UI styling
Node.js	Backend runtime
Express.js	REST API
MongoDB Atlas	Database
Google Maps API	Location and map functionality
Nodemailer	Email notifications
Vercel	Frontend deployment
Render	Backend deployment
📂 Project Structure
ParkEra/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── ...
│
├── README.md
└── ...

Adjust this section according to your actual folder structure. Don't put folders here that don't exist in your repository.

⚙️ Core Logic
Slot Booking

ParkEra prevents conflicting bookings by checking the selected slot's existing booking status and parking duration before confirming a new booking.

⏰ Parking Expiry

The system tracks the user's parking duration and sends an automated reminder before the booking expires.

⚠️ Late Parking Penalty

If the vehicle remains parked beyond the booked duration, ParkEra calculates a penalty based on the additional parking time.

Penalty = Extra Minutes × ₹1
🎫 Parking Passes

ParkEra provides passes for frequent users:

Pass	Price
15 Days	₹499
1 Month	₹899
3 Months	₹2,199
📧 Automated Notifications

ParkEra uses Nodemailer to send important parking-related emails, including:

Booking confirmation
Parking expiry reminder
Parking time expiry
Penalty notification
🎨 UI Design

ParkEra follows a map-first parking experience, allowing users to discover parking locations visually and quickly access available parking options.

The interface uses a minimal black, white, and mustard-yellow visual system.

🚀 Getting Started
1. Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

cd ParkEra
2. Install frontend dependencies
cd frontend
npm install
3. Install backend dependencies
cd ../backend
npm install
4. Configure environment variables

Create a .env file in the backend:

MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret

GOOGLE_MAPS_API_KEY=your_google_maps_api_key

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

Never commit your .env file to GitHub.

5. Start the backend
npm run dev
6. Start the frontend
cd frontend
npm run dev

The application should now be available locally.

🌐 Deployment
Frontend: Vercel
Backend: Render
Database: MongoDB Atlas

Add your actual deployed links here:

Live Demo: YOUR_VERCEL_URL
Backend API: YOUR_RENDER_URL
📸 Screenshots

Add screenshots/GIFs of the important screens here.

Recommended screenshots:

Home / landing page
Map and nearby parking
Parking details
Slot selection
Booking page
Booking confirmation
User dashboard
Admin dashboard

Example:

![ParkEra Home](screenshots/home.png)

![Parking Map](screenshots/map.png)

![Slot Booking](screenshots/booking.png)

![Admin Dashboard](screenshots/admin.png)
🎯 Problem Statement

Finding reliable parking in busy urban areas can be time-consuming. Users may have to search manually for available spaces, while parking operators need an organized way to manage slots and bookings.

ParkEra addresses this problem by bringing parking discovery, slot availability, booking, duration tracking, notifications, and penalty management into a single platform.

💡 Key Highlights
📍 Location-based parking discovery
🅿️ Digital parking slot management
🔄 FCFS-based booking logic
⏱️ Parking duration tracking
📧 Automated email notifications
⚠️ Automated penalty calculation
🎫 Subscription-style parking passes
👨‍💼 Admin management system
☁️ Full-stack cloud deployment
🔮 Future Improvements
🤖 "Hi ParkEra" AI voice assistant
📊 Parking demand analytics
💳 Integrated online payment gateway
📱 Mobile application
🧠 AI-based parking demand prediction
🚘 Number-plate recognition
🔔 Push notifications
📈 Advanced admin analytics
👩‍💻 Team

ParkEra — New Era of Parking

Developed by:

Purvi Bheda
Urja
Nidhi
📄 License

This project was developed as an academic/major project.
