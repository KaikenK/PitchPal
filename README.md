# PitchPal - Startup Funding Platform

A full-stack web-based database management application for connecting startups with investors. Built with React, Node.js/Express, and MySQL.

## Features

### 🚀 Founder Dashboard
- Complete CRUD operations for startups
- Find and pitch to matched investors based on domain
- View pitch statuses (Pending, Accepted, Rejected)
- Track funding rounds and total funding
- Two-way messaging with investors (after pitch acceptance)
- Real-time statistics: Total Startups, Pending Pitches, Accepted Pitches, Messages

### 💼 Investor Dashboard
- Browse startups in preferred investment domains
- View funding opportunities with detailed startup information
- Invest in startups (with automatic trigger validation for investment range)
- Accept/Reject pitch proposals from founders
- Track pitch matches and investment history
- Two-way messaging with founders
- Real-time statistics: Total Investments, Pending Pitches, Accepted Pitches, Messages

### ⚙️ Admin Dashboard
- Approve/reject new investor registrations
- View all pending and approved investor applications
- Moderate platform messages (Approve, Flag for review, Delete)
- View message moderation history with action types
- Platform oversight and security management

### 📊 Analytics & Reports
- **JOIN Query**: Startups with complete details (Founder + Domain info)
- **AGGREGATE Query**: Total startups per domain with bar chart visualization
- **NESTED Query**: Find all investors by domain with interactive dropdown
- Domain-wise startup distribution
- Latest funding rounds
- Pitch match statistics
- Interactive data visualization with Recharts

### 🔐 Authentication System
- Separate login for Founders, Investors, and Admins
- Secure password-based authentication
- Protected routes with role-based access control
- Registration system for new founders and investors
- Email uniqueness validation

### 💬 Messaging System
- Direct messaging between founders and investors
- Message moderation by admins
- Sender/recipient tracking
- Timestamp and moderation status display
- Real-time message updates

## Technology Stack

### Backend
- **Node.js v14+** with **Express.js 4.18** - RESTful API server
- **MySQL2 3.6** - MySQL client with Promise support and prepared statements
- **CORS** - Cross-origin resource sharing middleware
- **dotenv** - Environment variable management

### Frontend
- **React 18** - Component-based UI with hooks
- **React Router v6** - Client-side routing with protected routes
- **Axios 1.6** - HTTP client for API calls
- **Recharts 2.8** - Interactive data visualization
- **CSS3** - Responsive styling with modern layouts

### Database
- **MySQL 8.0** - Production-grade RDBMS with advanced features
- **Stored Procedures**: 
  - `sp_GetInvestorMatches(founder_id)` - Returns approved investors matching startup domains
  - `sp_CreatePitch(founder_id, investor_id)` - Creates pitch with duplicate validation
- **Stored Functions**:
  - `fn_CheckInvestorApprovalStatus(investor_id)` - Returns approval status
  - `fn_GetFounderStartupCount(founder_id)` - Returns startup count
- **Triggers**:
  - `trg_AfterInsertFundingRound` - Auto-updates startup total funding
  - `trg_BeforeInsertFundingRound_CheckRange` - Validates investment within investor's range
- **Complex Queries**: JOIN, AGGREGATE (GROUP BY + COUNT), NESTED (subqueries with IN)

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
│   │   │   ├── Home.js          # Landing page with role selection
│   │   │   ├── Login.js         # Authentication page
│   │   │   ├── Register.js      # User registration
│   │   │   ├── FounderDashboard.js  # Founder workspace
│   │   │   ├── InvestorDashboard.js # Investor workspace
│   │   │   ├── AdminDashboard.js    # Admin panel
│   │   │   └── Analytics.js     # Analytics & special reports
│   │   ├── components/
│   │   │   └── ProtectedRoute.js    # Route authentication
│   │   ├── context/
│   │   │   └── AuthContext.js   # Global auth state
│   │   ├── services/
│   │   │   └── api.js           # API client service
│   │   ├── App.js               # Main App component & routing
│   │   ├── App.css              # Global styles
│   │   └── index.js             # React entry point
│   └── package.json             # Frontend dependencies
│
├── database/
│   ├── pitchpal.sql             # Complete DB: schema, data, procedures, functions, triggers
│   ├── fix_procedures.sql       # Procedure update script
│   ├── update_procedure.sql     # Procedure maintenance
│   └── test_investor_matches.sql # Testing queries
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

**Option 1: Using command line redirection (from PitchPal directory)**
```bash
mysql -u root -p < database/pitchpal.sql
```

**Option 2: Using MySQL command line**
```bash
# First, login to MySQL
mysql -u root -p

# Then, once inside MySQL prompt:
```
```sql
source C:/Users/YOUR_USERNAME/path/to/PitchPal/database/pitchpal.sql;
```

**For Windows users:** Replace `/path/to/PitchPal` with your actual path using forward slashes (e.g., `C:/Users/dhruv/OneDrive/Desktop/DBMS/PitchPal/database/pitchpal.sql`)

**Utility SQL Files:**
- `fix_procedures.sql` - Recreates both stored procedures (use if procedures are missing)
- `update_procedure.sql` - Updates `sp_GetInvestorMatches` with approval check
- `test_investor_matches.sql` - Test queries to verify investor matching logic

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
- `GET /api/founder/:id/startup-count` - Get startup count (uses `fn_GetFounderStartupCount`)
- `GET /api/founder/:id/matches` - Get matched investors (uses `sp_GetInvestorMatches`)
- `GET /api/founder/:id/pitches` - Get founder's pitch history
- `GET /api/founder/:id/messages` - Get founder's messages
- `POST /api/founder` - Create new founder
- `PUT /api/founder/:id` - Update founder
- `DELETE /api/founder/:id` - Delete founder

### Investor Endpoints
- `GET /api/investor` - Get all investors with approval status
- `GET /api/investor/:id` - Get investor by ID
- `GET /api/investor/:id/domains` - Get investor's domain preferences
- `GET /api/investor/:id/startups` - Get startups in investor's domains
- `GET /api/investor/:id/funding-rounds` - Get investor's funding history
- `GET /api/investor/:id/total-investment` - Get total investment amount
- `GET /api/investor/:id/approval-status` - Check approval status (uses `fn_CheckInvestorApprovalStatus`)
- `GET /api/investor/:id/pitches` - Get investor's received pitches
- `GET /api/investor/:id/messages` - Get investor's messages
- `POST /api/investor` - Create new investor (with domain assignment)
- `POST /api/investor/:id/domains` - Add domain to investor
- `PUT /api/investor/:id` - Update investor
- `DELETE /api/investor/:id` - Delete investor

### Admin Endpoints
- `GET /api/admin` - Get all admins
- `GET /api/admin/:id` - Get admin by ID
- `GET /api/admin/approvals/pending` - Get pending investor approvals
- `GET /api/admin/approvals/all` - Get all investor approvals
- `POST /api/admin/approvals` - Create/approve investor
- `GET /api/admin/messages/all` - Get all messages with sender/recipient names
- `GET /api/admin/messages/unmoderated` - Get unmoderated messages
- `POST /api/admin/messages/moderate` - Moderate message (Approved/Flagged/Deleted)
- `GET /api/admin/moderations/all` - Get moderation history
- `POST /api/admin` - Create new admin
- `PUT /api/admin/:id` - Update admin
- `DELETE /api/admin/:id` - Delete admin

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
- `GET /api/pitchmatch/:id` - Get pitch match by ID
- `POST /api/pitchmatch` - Create pitch (uses `sp_CreatePitch` with validation)
- `PUT /api/pitchmatch/:id` - Update pitch status (Accept/Reject)
- `DELETE /api/pitchmatch/:id` - Delete pitch

### Message Endpoints
- `GET /api/message` - Get all messages
- `GET /api/message/:id` - Get message by ID
- `GET /api/message/conversation/:type1/:id1/:type2/:id2` - Get conversation
- `POST /api/message` - Send message
- `DELETE /api/message/:id` - Delete message

### Analytics Endpoints
- `GET /api/analytics/startups-per-domain` - Startups grouped by domain
- `GET /api/analytics/founders-startup-count` - Uses `fn_GetFounderStartupCount`
- `GET /api/analytics/latest-funding-rounds` - Recent funding activity
- `GET /api/analytics/total-funding-per-startup` - Funding progress per startup
- `GET /api/analytics/top-investors` - Top investors by investment amount
- `GET /api/analytics/funding-trends` - Time-series funding data
- `GET /api/analytics/dashboard-summary` - Platform overview statistics
- **Special Report Queries:**
  - `GET /api/analytics/report/startups-with-details` - JOIN query (Startup + Founder + Domain)
  - `GET /api/analytics/report/domain-startup-count` - AGGREGATE query (GROUP BY + COUNT)
  - `GET /api/analytics/report/investors-by-domain/:domainName` - NESTED query (subquery with IN)
  - `GET /api/analytics/report/available-domains` - Get all available domains

## Database Features

### Stored Procedures
1. **`sp_GetInvestorMatches(founder_id)`**
   - Returns investors matching the founder's startup domains
   - Filters out already-pitched investors
   - **Only returns approved investors** (checks `AdminInvestorApproval` table)
   - Used in: Founder Dashboard → "Find Investors to Pitch"

2. **`sp_CreatePitch(founder_id, investor_id)`**
   - Creates a new pitch match with status 'Pending'
   - **Validates no duplicate pitch exists** (SIGNAL on duplicate)
   - Returns success message or error
   - Used in: Founder Dashboard → "Send Pitch"

### Stored Functions
1. **`fn_CheckInvestorApprovalStatus(investor_id)`**
   - Returns 'Approved' or 'Pending Approval'
   - Checks existence in `AdminInvestorApproval` table
   - Used in: Investor Dashboard stats

2. **`fn_GetFounderStartupCount(founder_id)`**
   - Returns total count of startups owned by founder
   - Used in: Analytics dashboard

### Triggers
1. **`trg_AfterInsertFundingRound`** (AFTER INSERT on FundingRound)
   - **Automatically updates** the `Startup.funding` column
   - Adds new investment amount to existing total
   - Ensures startup funding is always current

2. **`trg_BeforeInsertFundingRound_CheckRange`** (BEFORE INSERT on FundingRound)
   - **Validates investment amount** is within investor's `min_investment` and `max_investment`
   - **SIGNAL error** if amount is outside range
   - Prevents invalid investment amounts

### Complex Queries (for Final Report)
1. **JOIN Query** - Startups with Complete Details
   ```sql
   SELECT s.*, f.name AS founder_name, d.d_name AS domain_name
   FROM Startup s
   JOIN Founder f ON s.founder_id = f.founder_id
   JOIN Domain d ON s.domain_id = d.domain_id
   ```

2. **AGGREGATE Query** - Domain Startup Count
   ```sql
   SELECT d.d_name, COUNT(s.startup_id) AS startup_count
   FROM Domain d
   LEFT JOIN Startup s ON d.domain_id = s.domain_id
   GROUP BY d.domain_id, d.d_name
 
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

The `pitchpal.sql` file includes:
- **8 Domains**: FinTech, EdTech, HealthTech, SaaS, AI/ML, E-commerce, AgriTech, Logistics
- **2 Admins**: System administrators with different access levels
- **6 Founders**: Startup founders with email/password authentication
- **6 Investors**: Investment entities with min/max investment ranges
- **Investor Domain Preferences**: Multiple domains per investor
- **6 Startups**: Various stages (Pre-Seed, Seed, Series A, Series B) across different domains
- **5 Funding Rounds**: Investment transactions with auto-updated startup funding
- **7 Pitch Matches**: Founder-Investor pitches with status (Pending, Accepted, Rejected)
- **9 Messages**: Two-way communication between founders and investors
- **6 Admin Approvals**: Investor approval records
- **3 Message Moderations**: Admin moderation actions (Approved, Flagged for review, Deleted)

### Sample Login Credentials:
- **Founder**: arjun@startup.com / password
- **Investor**: anilvc@invest.com / password
- **Admin**: super@pitchpal.com / (use name "SuperAdmin" as password)

## Usage Examples

### 1. Register & Login
1. Navigate to `http://localhost:3000`
2. Click "Register" to create a new account (Founder or Investor)
3. Login with your email and password

### 2. Founder Workflow
1. Login as Founder: `arjun@startup.com` / `password`
2. View dashboard at `http://localhost:3000/founder/1`
3. **Create Startup**: Click "Add New Startup", fill details
4. **Find Investors**: Click "Find Investors to Pitch"
5. **Send Pitch**: Click "Send Pitch" to matching investors
6. **Send Message**: After pitch acceptance, message investors

### 3. Investor Workflow
1. Login as Investor: `anilvc@invest.com` / `password`
2. View dashboard at `http://localhost:3000/investor/1`
3. **Review Pitches**: See pending pitches from founders
4. **Accept/Reject**: Update pitch status
5. **Invest in Startups**: Browse startups and invest (validated by trigger)
6. **Message Founders**: Communicate with accepted pitch founders

### 4. Admin Operations
1. Login as Admin: `super@pitchpal.com` / `SuperAdmin`
2. View admin panel at `http://localhost:3000/admin/1`
3. **Approve Investors**: Review and approve pending investor registrations
4. **Moderate Messages**: Flag/Approve/Delete messages
5. **View Statistics**: Monitor platform activity

### 5. View Analytics
Navigate to `http://localhost:3000/analytics` for:
- JOIN query: Startups with complete details
- AGGREGATE query: Domain startup distribution chart
- NESTED query: Investors filtered by domain

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