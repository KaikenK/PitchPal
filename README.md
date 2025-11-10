# PitchPal - Startup Funding Platform

A full-stack web-based database management application for connecting startups with investors. Built with React, Node.js/Express, and MySQL.

## Features

### 🚀 Founder Dashboard
- Complete CRUD operations for startups
- View matched investors based on domain
- Create pitch proposals to investors
- Track pitch statuses and funding rounds
- Messaging with investors

### 💼 Investor Dashboard
- Browse startups in investment domains
- View total investments and funding history
- Invest in startups (with trigger validation)
- Track pitch matches and responses
- Messaging with founders

### ⚙️ Admin Dashboard
- Approve/reject new investors
- Moderate platform messages
- View all system activities
- Check investor approval status
- Platform analytics and oversight

### 📊 Analytics & Reports
- Total startups per domain (aggregate queries)
- Founder startup counts (using custom function)
- Latest funding rounds
- Total funding per startup with progress
- Top investors by investment amount
- Funding trends over time
- Startup stage distribution
- Pitch match success rates

## Technology Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **MySQL** - Relational database with stored procedures, functions, and triggers
- **mysql2** - MySQL client for Node.js with Promise support
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - Component-based UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization charts
- **CSS3** - Responsive styling

### Database
- **MySQL** - Production-grade RDBMS
- Stored procedures (sp_GetInvestorMatches, sp_CreatePitch)
- Functions (fn_CheckInvestorApprovalStatus, fn_GetFounderStartupCount)
- Triggers (funding validation, auto-approval, funding updates)

## Project Structure

```
PitchPal/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── routes/
│   │   ├── founder.js           # Founder API endpoints
│   │   ├── investor.js          # Investor API endpoints
│   │   ├── admin.js             # Admin API endpoints
│   │   ├── startup.js           # Startup CRUD operations
│   │   ├── funding.js           # Funding round operations
│   │   ├── domain.js            # Domain management
│   │   ├── pitchmatch.js        # Pitch matching logic
│   │   ├── message.js           # Messaging system
│   │   └── analytics.js         # Reports and analytics
│   ├── server.js                # Express application
│   └── package.json             # Backend dependencies
│
├── frontend/
│   ├── public/
│   │   └── index.html           # HTML template
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js          # Landing page
│   │   │   ├── FounderDashboard.js
│   │   │   ├── InvestorDashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── Analytics.js     # Analytics dashboard
│   │   ├── services/
│   │   │   └── api.js           # API client service
│   │   ├── App.js               # Main App component
│   │   ├── App.css              # Global styles
│   │   └── index.js             # React entry point
│   └── package.json             # Frontend dependencies
│
├── database/
│   ├── schema.sql               # Database schema with procedures/functions
│   └── seed.sql                 # Sample data
│
├── .env.example                 # Environment configuration template
└── README.md                    # This file
```

## Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/KaikenK/PitchPal.git
cd PitchPal
```

### 2. Database Setup

#### Start MySQL Server
```bash
# On Ubuntu/Debian
sudo service mysql start

# On macOS with Homebrew
brew services start mysql

# On Windows
# Start MySQL from Services or MySQL Workbench
```

#### Create Database and Load Schema
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Or using MySQL command line:
```sql
source /path/to/PitchPal/database/schema.sql;
source /path/to/PitchPal/database/seed.sql;
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp ../.env.example .env

# Edit .env with your MySQL credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=PitchPalDB
# PORT=5000

# Start the server
npm start

# For development with auto-reload
npm run dev
```

Backend will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start the development server
npm start
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Founder Endpoints
- `GET /api/founder` - Get all founders
- `GET /api/founder/:id` - Get founder by ID
- `GET /api/founder/:id/startups` - Get founder's startups
- `GET /api/founder/:id/startup-count` - Get startup count (uses function)
- `GET /api/founder/:founderId/startup/:startupId/matches` - Get matched investors (uses stored procedure)
- `GET /api/founder/:id/pitches` - Get founder's pitches
- `GET /api/founder/:id/messages` - Get founder's messages
- `POST /api/founder` - Create new founder
- `PUT /api/founder/:id` - Update founder
- `DELETE /api/founder/:id` - Delete founder

### Investor Endpoints
- `GET /api/investor` - Get all investors
- `GET /api/investor/:id` - Get investor by ID
- `GET /api/investor/:id/domains` - Get investor's domains
- `GET /api/investor/:id/startups` - Get startups in investor's domains
- `GET /api/investor/:id/funding-rounds` - Get investor's funding history
- `GET /api/investor/:id/total-investment` - Get total investments
- `GET /api/investor/:id/approval-status` - Check approval status (uses function)
- `GET /api/investor/:id/pitches` - Get investor's pitches
- `POST /api/investor` - Create new investor
- `POST /api/investor/:id/domains` - Add domain to investor
- `PUT /api/investor/:id` - Update investor
- `DELETE /api/investor/:id` - Delete investor

### Admin Endpoints
- `GET /api/admin` - Get all admins
- `GET /api/admin/approvals/pending` - Get pending approvals
- `GET /api/admin/approvals/all` - Get all approvals
- `POST /api/admin/approvals` - Create approval
- `PUT /api/admin/approvals/:id` - Update approval
- `GET /api/admin/messages/all` - Get all messages
- `GET /api/admin/messages/unmoderated` - Get unmoderated messages
- `POST /api/admin/messages/moderate` - Moderate message

### Startup Endpoints
- `GET /api/startup` - Get all startups
- `GET /api/startup/:id` - Get startup by ID
- `GET /api/startup/:id/funding-rounds` - Get startup funding rounds
- `POST /api/startup` - Create new startup
- `PUT /api/startup/:id` - Update startup
- `DELETE /api/startup/:id` - Delete startup

### Funding Endpoints
- `GET /api/funding` - Get all funding rounds
- `POST /api/funding` - Create funding round (validated by trigger)
- `PUT /api/funding/:id` - Update funding round
- `DELETE /api/funding/:id` - Delete funding round

### PitchMatch Endpoints
- `GET /api/pitchmatch` - Get all pitch matches
- `POST /api/pitchmatch` - Create pitch (uses stored procedure)
- `PUT /api/pitchmatch/:id` - Update pitch status
- `DELETE /api/pitchmatch/:id` - Delete pitch

### Analytics Endpoints
- `GET /api/analytics/startups-per-domain` - Aggregate by domain
- `GET /api/analytics/founders-startup-count` - Uses custom function
- `GET /api/analytics/latest-funding-rounds` - Recent funding
- `GET /api/analytics/total-funding-per-startup` - Funding progress
- `GET /api/analytics/top-investors` - Investor rankings
- `GET /api/analytics/funding-trends` - Time-series data
- `GET /api/analytics/dashboard-summary` - Overview stats

## Database Features

### Stored Procedures
1. **sp_GetInvestorMatches(startupID)** - Returns matched investors based on domain
2. **sp_CreatePitch(startupID, investorID, notes)** - Creates pitch with domain validation

### Functions
1. **fn_CheckInvestorApprovalStatus(investorID)** - Returns approval status
2. **fn_GetFounderStartupCount(founderID)** - Returns startup count

### Triggers
1. **trg_ValidateFundingAmount** - Validates funding amount range (1 - 10,000,000)
2. **trg_UpdateStartupFunding** - Auto-updates startup current funding
3. **trg_AutoApproveInvestor** - Auto-approves investor on admin approval

## Security Features

- **Prepared Statements** - All database queries use parameterized statements to prevent SQL injection
- **Input Validation** - Express-validator middleware for request validation
- **CORS Configuration** - Controlled cross-origin access
- **Environment Variables** - Sensitive credentials stored in .env files
- **Error Handling** - Comprehensive error handling and logging
- **Database Triggers** - Business rule enforcement at database level

## Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

The build folder will contain optimized production files.

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your_production_host
DB_USER=your_production_user
DB_PASSWORD=your_production_password
DB_NAME=PitchPalDB
PORT=5000
```

### Deployment Options
- **Heroku** - Deploy backend and frontend separately
- **AWS** - Use EC2 for backend, S3 + CloudFront for frontend, RDS for MySQL
- **DigitalOcean** - Deploy on droplets with managed MySQL
- **Docker** - Containerize both backend and frontend

## Sample Data

The seed.sql file includes:
- 8 Domains (Technology, Healthcare, Finance, etc.)
- 2 Admins
- 4 Founders
- 4 Investors (3 approved, 1 pending)
- 6 Startups
- 5 Funding Rounds
- 7 Pitch Matches
- 6 Messages
- 4 Admin Approvals

## Usage Examples

### View Founder Dashboard
Navigate to `http://localhost:3000/founder/1` to view John Doe's dashboard

### View Investor Dashboard
Navigate to `http://localhost:3000/investor/1` to view Tech Ventures dashboard

### View Admin Dashboard
Navigate to `http://localhost:3000/admin/1` to access admin functions

### View Analytics
Navigate to `http://localhost:3000/analytics` for comprehensive platform analytics

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env` file
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### CORS Issues
- Ensure backend CORS is configured for your frontend URL
- Check REACT_APP_API_URL in frontend .env

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Project Link: [https://github.com/KaikenK/PitchPal](https://github.com/KaikenK/PitchPal)

## Acknowledgments

- React documentation
- Express.js framework
- MySQL documentation
- Recharts library for data visualization