-- Seed Data for PitchPal Database
USE PitchPalDB;

-- Insert Domains
INSERT INTO Domain (DomainName, Description) VALUES
('Technology', 'Software, hardware, and IT solutions'),
('Healthcare', 'Medical devices, healthcare services, and biotech'),
('Finance', 'Fintech, banking, and financial services'),
('E-commerce', 'Online retail and marketplaces'),
('Education', 'EdTech and learning platforms'),
('Energy', 'Renewable energy and sustainability'),
('Real Estate', 'Property technology and real estate services'),
('Food & Beverage', 'Food tech and restaurant services');

-- Insert Admins (password: admin123)
INSERT INTO Admin (Username, Email, PasswordHash, FullName) VALUES
('admin1', 'admin1@pitchpal.com', '$2b$10$XqZYJZKZ0YZ1Z2Z3Z4Z5Z6', 'John Administrator'),
('admin2', 'admin2@pitchpal.com', '$2b$10$XqZYJZKZ0YZ1Z2Z3Z4Z5Z6', 'Sarah Admin');

-- Insert Founders (password: founder123)
INSERT INTO Founder (Username, Email, PasswordHash, FullName, Bio) VALUES
('john_founder', 'john@startup.com', '$2b$10$XqZYJZKZ0YZ1Z2Z3Z4Z5Z6', 'John Doe', 'Serial entrepreneur with 10 years of experience'),
('jane_founder', 'jane@innovate.com', '$2b$10$XqZYJZKZ0YZ1Z2Z3Z4Z5Z6', 'Jane Smith', 'Tech innovator and software architect'),
('mike_founder', 'mike@medtech.com', '$2b$10$XqZYJZKZ0YZ1Z2Z3Z4Z5Z6', 'Mike Johnson', 'Healthcare entrepreneur'),
('sarah_founder', 'sarah@edutech.com', '$2b$10$XqZYJZKZ0YZ1Z2Z3Z4Z5Z6', 'Sarah Williams', 'Education technology pioneer');

-- Insert Investors (password: investor123)
INSERT INTO Investor (Username, Email, PasswordHash, FullName, Bio, TotalInvestmentCapacity, IsApproved) VALUES
('investor_tech', 'tech@investor.com', '$2b$10$XqZYJZKZ0YZ1Z2Z3Z4Z5Z6', 'Tech Ventures LLC', 'Leading technology investor', 5000000.00, TRUE),
('investor_health', 'health@investor.com', '$2b$10$XqZYJZKZ0YZ1Z2Z3Z4Z5Z6', 'HealthCare Capital', 'Healthcare focused investment firm', 3000000.00, TRUE),
('investor_multi', 'multi@investor.com', '$2b$10$XqZYJZKZ0YZ1Z2Z3Z4Z5Z6', 'Multi-Domain Ventures', 'Diversified investment portfolio', 10000000.00, TRUE),
('investor_new', 'new@investor.com', '$2b$10$XqZYJZKZ0YZ1Z2Z3Z4Z5Z6', 'NewComer Investor', 'New investor awaiting approval', 2000000.00, FALSE);

-- Map Investors to Domains
INSERT INTO InvestorDomain (InvestorID, DomainID) VALUES
(1, 1), -- Tech investor -> Technology
(1, 4), -- Tech investor -> E-commerce
(2, 2), -- Health investor -> Healthcare
(3, 1), -- Multi investor -> Technology
(3, 2), -- Multi investor -> Healthcare
(3, 3), -- Multi investor -> Finance
(3, 5), -- Multi investor -> Education
(4, 1); -- New investor -> Technology

-- Insert Startups
INSERT INTO Startup (FounderID, DomainID, StartupName, Description, FundingGoal, CurrentFunding, Stage) VALUES
(1, 1, 'AI Solutions Inc', 'Artificial intelligence platform for business automation', 1000000.00, 250000.00, 'Series A'),
(1, 4, 'ShopEasy', 'E-commerce platform with AI recommendations', 500000.00, 100000.00, 'Seed'),
(2, 1, 'CodeMaster', 'Developer tools and IDE platform', 750000.00, 0.00, 'Pre-seed'),
(3, 2, 'HealthTrack', 'Personal health monitoring wearable device', 2000000.00, 500000.00, 'Series A'),
(3, 2, 'MediConnect', 'Telemedicine platform connecting patients and doctors', 1500000.00, 300000.00, 'Seed'),
(4, 5, 'LearnHub', 'Online learning platform with interactive courses', 800000.00, 200000.00, 'Seed');

-- Insert Funding Rounds
INSERT INTO FundingRound (StartupID, InvestorID, Amount, Notes) VALUES
(1, 1, 250000.00, 'Initial seed funding round'),
(2, 1, 100000.00, 'Pre-seed investment'),
(4, 2, 500000.00, 'Series A lead investment'),
(5, 2, 300000.00, 'Strategic partnership investment'),
(6, 3, 200000.00, 'Seed round participation');

-- Insert Pitch Matches
INSERT INTO PitchMatch (StartupID, InvestorID, Status, Notes) VALUES
(1, 1, 'Accepted', 'Great AI technology with strong team'),
(1, 3, 'Pending', 'Reviewing business model'),
(2, 1, 'Accepted', 'Innovative e-commerce approach'),
(3, 1, 'Pending', 'Awaiting technical demo'),
(4, 2, 'Accepted', 'Revolutionary health monitoring'),
(5, 2, 'Accepted', 'Strong telemedicine platform'),
(6, 3, 'Pending', 'Evaluating market opportunity');

-- Insert Messages
INSERT INTO Message (SenderType, SenderID, ReceiverType, ReceiverID, MessageContent, IsModerated) VALUES
('Founder', 1, 'Investor', 1, 'Thank you for investing in AI Solutions! Looking forward to our partnership.', TRUE),
('Investor', 1, 'Founder', 1, 'Excited to be part of your journey. Let''s schedule a board meeting.', TRUE),
('Founder', 2, 'Investor', 1, 'Would love to discuss our developer tools platform with you.', TRUE),
('Founder', 3, 'Investor', 2, 'Our health monitoring device has FDA approval. Can we meet?', TRUE),
('Investor', 2, 'Founder', 3, 'Congratulations on FDA approval! Let''s discuss investment terms.', TRUE),
('Founder', 4, 'Investor', 3, 'LearnHub has reached 10,000 active users. Ready to scale.', FALSE);

-- Insert Admin Investor Approvals
INSERT INTO AdminInvestorApproval (AdminID, InvestorID, ApprovalStatus, Notes) VALUES
(1, 1, 'Approved', 'Verified investor with strong track record'),
(1, 2, 'Approved', 'Healthcare investment specialist verified'),
(2, 3, 'Approved', 'Large diversified fund with excellent reputation'),
(1, 4, 'Pending', 'Awaiting background check completion');

-- Insert Message Moderations
INSERT INTO MessageModeration (MessageID, AdminID, Action, Reason) VALUES
(1, 1, 'Approved', 'Professional communication'),
(2, 1, 'Approved', 'Business-related discussion'),
(3, 1, 'Approved', 'Valid pitch inquiry'),
(4, 2, 'Approved', 'Appropriate business message'),
(5, 2, 'Approved', 'Professional investment discussion');
