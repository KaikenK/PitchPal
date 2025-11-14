-- ------------------------------------------------------
-- PitchPalDB Consolidated SQL File
-- ------------------------------------------------------
-- This file contains:
-- 1. Database and Table Schema Creation
-- 2. Sample Data Insertion
-- 3. Stored Functions (for Review 3)
-- 4. Stored Procedures (for Review 3)
-- 5. Triggers (for Review 3)
-- 6. Demonstration & Report Queries
-- ------------------------------------------------------

-- ------------------------------------------------------
-- 1. DATABASE AND TABLE SCHEMA CREATION
-- ------------------------------------------------------
CREATE DATABASE IF NOT EXISTS PitchPalDB;
USE PitchPalDB;

-- Drop tables in reverse order of dependency
DROP TABLE IF EXISTS MessageModeration;
DROP TABLE IF EXISTS AdminInvestorApproval;
DROP TABLE IF EXISTS InvestorDomain;
DROP TABLE IF EXISTS Message;
DROP TABLE IF EXISTS PitchMatch;
DROP TABLE IF EXISTS FundingRound;
DROP TABLE IF EXISTS Startup;
DROP TABLE IF EXISTS Admin;
DROP TABLE IF EXISTS Investor;
DROP TABLE IF EXISTS Domain;
DROP TABLE IF EXISTS Founder;

-- Create tables
CREATE TABLE Admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50),
    access_level VARCHAR(50)
);

CREATE TABLE Founder (
    founder_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE Domain (
    domain_id INT PRIMARY KEY AUTO_INCREMENT,
    d_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Investor (
    investor_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    funds DECIMAL(15,2),
    min_investment DECIMAL(15,2),
    max_investment DECIMAL(15,2)
);

CREATE TABLE InvestorDomain (
    investor_id INT,
    domain_id INT,
    PRIMARY KEY (investor_id, domain_id),
    FOREIGN KEY (investor_id) REFERENCES Investor(investor_id) ON DELETE CASCADE,
    FOREIGN KEY (domain_id) REFERENCES Domain(domain_id) ON DELETE CASCADE
);

CREATE TABLE Startup (
    startup_id INT PRIMARY KEY AUTO_INCREMENT,
    founder_id INT NOT NULL,
    domain_id INT,
    name VARCHAR(100) NOT NULL,
    stage VARCHAR(50),
    funding DECIMAL(15,2) DEFAULT 0.00,
    description TEXT,
    FOREIGN KEY (founder_id) REFERENCES Founder(founder_id) ON DELETE CASCADE,
    FOREIGN KEY (domain_id) REFERENCES Domain(domain_id) ON DELETE SET NULL
);

CREATE TABLE FundingRound (
    funding_round_id INT PRIMARY KEY AUTO_INCREMENT,
    startup_id INT NOT NULL,
    investor_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (startup_id) REFERENCES Startup(startup_id) ON DELETE CASCADE,
    FOREIGN KEY (investor_id) REFERENCES Investor(investor_id) ON DELETE CASCADE
);

CREATE TABLE PitchMatch (
    pitch_match_id INT PRIMARY KEY AUTO_INCREMENT,
    founder_id INT NOT NULL,
    investor_id INT NOT NULL,
    pitch_date DATE DEFAULT (CURDATE()),
    status VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (founder_id) REFERENCES Founder(founder_id) ON DELETE CASCADE,
    FOREIGN KEY (investor_id) REFERENCES Investor(investor_id) ON DELETE CASCADE,
    UNIQUE (founder_id, investor_id)
);

CREATE TABLE Message (
    m_id INT PRIMARY KEY AUTO_INCREMENT,
    founder_id INT NOT NULL,
    investor_id INT NOT NULL,
    content TEXT NOT NULL,
    sender_type ENUM('FOUNDER', 'INVESTOR') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (founder_id) REFERENCES Founder(founder_id) ON DELETE CASCADE,
    FOREIGN KEY (investor_id) REFERENCES Investor(investor_id) ON DELETE CASCADE
);

CREATE TABLE AdminInvestorApproval (
    admin_id INT,
    investor_id INT,
    approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_id, investor_id),
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id) ON DELETE CASCADE,
    FOREIGN KEY (investor_id) REFERENCES Investor(investor_id) ON DELETE CASCADE
);

CREATE TABLE MessageModeration (
    admin_id INT,
    m_id INT,
    action VARCHAR(100),
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_id, m_id),
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id) ON DELETE CASCADE,
    FOREIGN KEY (m_id) REFERENCES Message(m_id) ON DELETE CASCADE
);

-- ------------------------------------------------------
-- 2. SAMPLE DATA INSERTION
-- ------------------------------------------------------
INSERT INTO Admin (name, email, role, access_level) VALUES
('Super Admin', 'admin@pitchpal.com', 'System Administrator', 'Full'),
('Jane Doe', 'jane.doe@pitchpal.com', 'Content Moderator', 'Limited'),
('John Smith', 'john.s@pitchpal.com', 'Support Specialist', 'Limited'),
('Priya Singh', 'priya.s@pitchpal.com', 'Investor Relations', 'Full'),
('Amit Patel', 'amit.p@pitchpal.com', 'Compliance Officer', 'Full');

INSERT INTO Founder (name, email, password) VALUES
('Arjun Mehta', 'arjun@startup.com', 'hash_arjun123'),
('Sneha Rao', 'sneha@startup.com', 'hash_sneha456'),
('Kiran Sharma', 'kiran@startup.com', 'hash_kiran789'),
('Rohan Desai', 'rohan@startup.com', 'hash_rohan123'),
('Meera Krishnan', 'meera@startup.com', 'hash_meera456'),
('Vikram Singh', 'vikram@startup.com', 'hash_vikram789'),
('Anjali Iyer', 'anjali@startup.com', 'hash_anjali111');

INSERT INTO Domain (d_name) VALUES
('FinTech'), ('EdTech'), ('HealthTech'), ('SaaS'), ('AI/ML'), ('E-commerce'), ('AgriTech'), ('Logistics');

INSERT INTO Investor (name, email, password, funds, min_investment, max_investment) VALUES
('Anil Kumar', 'anilvc@invest.com', 'hash_anilvc', 50000000.00, 100000.00, 5000000.00),
('Meera Iyer', 'meeraangels@invest.com', 'hash_meeraang', 75000000.00, 500000.00, 10000000.00),
('Vikram Reddy', 'vikramseed@invest.com', 'hash_vikramseed', 30000000.00, 50000.00, 1000000.00),
('Nisha Shah', 'nishavc@invest.com', 'hash_nishavc', 100000000.00, 1000000.00, 20000000.00),
('Sandeep Verma', 'sandeepai@invest.com', 'hash_sandeepml', 60000000.00, 250000.00, 8000000.00),
('Alok Jain', 'alok.j@invest.com', 'hash_alokjain', 40000000.00, 50000.00, 2000000.00);

INSERT INTO InvestorDomain (investor_id, domain_id) VALUES
(1, 1), (1, 4),
(2, 2),
(3, 3), (3, 5),
(4, 4), (4, 6),
(5, 5), (5, 8),
(6, 7), (6, 1),
(2, 5),
(4, 8);

INSERT INTO Startup (founder_id, domain_id, name, stage, funding, description) VALUES
(1, 1, 'PaySwift', 'Seed', 500000.00, 'Mobile-first payment gateway for small retailers'),
(2, 2, 'LearnSphere', 'Series A', 2000000.00, 'AI-powered adaptive learning platform for students'),
(3, 3, 'MediTrack', 'Pre-Seed', 150000.00, 'IoT-enabled patient monitoring for urban hospitals'),
(4, 6, 'FreshCart', 'Series B', 5000000.00, 'Subscription based e-commerce for organic groceries'),
(5, 7, 'CropIntel', 'Seed', 400000.00, 'AI-driven crop monitoring for precision agriculture'),
(6, 8, 'QuickHaul', 'Series A', 3000000.00, 'Platform for optimizing last-mile delivery logistics'),
(7, 4, 'CodeDeploy', 'Seed', 750000.00, 'A SaaS platform for automated code deployment and monitoring');

-- Note: The `funding` in the Startup table already accounts for these.
-- The `trg_AfterInsertFundingRound` will update funding for *new* inserts.
INSERT INTO FundingRound (startup_id, investor_id, amount, date) VALUES
(1, 1, 500000.00, '2024-02-12'),
(2, 2, 2000000.00, '2024-01-25'),
(3, 3, 150000.00, '2024-03-10'),
(4, 4, 5000000.00, '2023-11-05'),
(5, 6, 400000.00, '2024-04-18'),
(6, 5, 3000000.00, '2024-05-20'),
(7, 1, 750000.00, '2024-06-01');
-- (2, 5, 1000000.00, '2025-01-15'); -- This was an example insert, will be used later

INSERT INTO PitchMatch (founder_id, investor_id, status) VALUES
(1, 1, 'Accepted'), (2, 2, 'Accepted'), (3, 3, 'Pending'),
(4, 4, 'Accepted'), (5, 6, 'Accepted'), (6, 5, 'Pending'),
(7, 1, 'Accepted'), (1, 4, 'Rejected'), (5, 1, 'Pending');

INSERT INTO Message (founder_id, investor_id, content, sender_type) VALUES
(1, 1, 'Hello Anil, thank you for the seed funding for PaySwift.', 'FOUNDER'),
(1, 1, 'You are welcome, Arjun. Keep up the great work.', 'INVESTOR'),
(2, 2, 'Hi Meera, LearnSphere is preparing for its next funding round.', 'FOUNDER'),
(3, 3, 'Dear Vikram, attaching the MediTrack prototype video for your review.', 'FOUNDER'),
(4, 4, 'Hi Nisha, FreshCart has hit our quarterly targets.', 'FOUNDER'),
(4, 4, 'Excellent news, Rohan. Let us schedule a follow-up call.', 'INVESTOR'),
(5, 6, 'Hello Alok, we believe CropIntel can revolutionize the AgriTech space.', 'FOUNDER'),
(7, 1, 'Hi Anil, attaching our monthly report for CodeDeploy.', 'FOUNDER');

INSERT INTO AdminInvestorApproval (admin_id, investor_id) VALUES
(1, 1), (1, 2), (1, 3), (4, 4), (4, 5), (5, 6);

INSERT INTO MessageModeration (admin_id, m_id, action) VALUES
(2, 1, 'Flagged for review'),
(2, 2, 'Approved'),
(2, 3, 'Approved'),
(2, 4, 'Flagged for review'),
(3, 5, 'Approved'),
(2, 6, 'Approved'),
(3, 8, 'Approved');


-- ------------------------------------------------------
-- 3. STORED FUNCTIONS
-- ------------------------------------------------------

-- Change delimiter for function creation
DELIMITER $$

-- FUNCTION 1: Check Investor Approval Status
CREATE FUNCTION fn_CheckInvestorApprovalStatus(
    in_investor_id INT
)
RETURNS VARCHAR(20)
READS SQL DATA
BEGIN
    DECLARE approval_count INT DEFAULT 0;

    -- Count how many approval records exist for this investor
    SELECT COUNT(*)
    INTO approval_count
    FROM AdminInvestorApproval
    WHERE investor_id = in_investor_id;

    IF approval_count > 0 THEN
        RETURN 'Approved';
    ELSE
        RETURN 'Pending Approval';
    END IF;
END$$

-- FUNCTION 2: Get a Founder's Startup Count
CREATE FUNCTION fn_GetFounderStartupCount(
    in_founder_id INT
)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE startup_count INT DEFAULT 0;

    SELECT COUNT(*)
    INTO startup_count
    FROM Startup
    WHERE founder_id = in_founder_id;

    RETURN startup_count;
END$$

DELIMITER ;


-- ------------------------------------------------------
-- 4. STORED PROCEDURES (for Review 3)
-- ------------------------------------------------------

-- Change delimiter for procedure creation
DELIMITER $$

-- PROCEDURE 1: Create a New Pitch
CREATE PROCEDURE sp_CreatePitch(
    IN in_founder_id INT,
    IN in_investor_id INT
)
BEGIN
    DECLARE existing_pitch INT DEFAULT 0;

    -- Check if a pitch match already exists
    SELECT COUNT(*)
    INTO existing_pitch
    FROM PitchMatch
    WHERE founder_id = in_founder_id AND investor_id = in_investor_id;

    -- If no pitch exists, create a new one
    IF existing_pitch = 0 THEN
        INSERT INTO PitchMatch (founder_id, investor_id, status)
        VALUES (in_founder_id, in_investor_id, 'Pending');
        SELECT 'Pitch created successfully.' AS message;
    ELSE
        -- If a pitch exists, raise an error
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A pitch between this founder and investor already exists.';
    END IF;
END$$


-- PROCEDURE 2: Find Investor Matches for a Founder
CREATE PROCEDURE sp_GetInvestorMatches(
    IN in_founder_id INT
)
BEGIN
    SELECT
        i.investor_id,
        i.name,
        i.email,
        d.d_name AS matching_domain
    FROM Investor i
    -- Find investors and their preferred domains
    JOIN InvestorDomain idom ON i.investor_id = idom.investor_id
    JOIN Domain d ON idom.domain_id = d.domain_id
    WHERE
        -- Match investors to the domains of the founder's startups
        idom.domain_id IN (
            SELECT DISTINCT domain_id
            FROM Startup
            WHERE founder_id = in_founder_id
        )
        -- Filter out investors the founder has already pitched
        AND i.investor_id NOT IN (
            SELECT investor_id
            FROM PitchMatch
            WHERE founder_id = in_founder_id
        )
        -- Only show approved investors
        AND i.investor_id IN (
            SELECT investor_id
            FROM AdminInvestorApproval
        );
END$$
DELIMITER ;


-- ------------------------------------------------------
-- 5. TRIGGERS (for Review 3)
-- ------------------------------------------------------

-- Change delimiter for trigger creation
DELIMITER $$

-- TRIGGER 1: Update Total Startup Funding after a FundingRound is inserted
CREATE TRIGGER trg_AfterInsertFundingRound
AFTER INSERT ON FundingRound
FOR EACH ROW
BEGIN
    -- Add the new funding amount to the startup's total funding
    UPDATE Startup
    SET funding = funding + NEW.amount
    WHERE startup_id = NEW.startup_id;
END$$

-- TRIGGER 2: Check Investment Range before a FundingRound is inserted
CREATE TRIGGER trg_BeforeInsertFundingRound_CheckRange
BEFORE INSERT ON FundingRound
FOR EACH ROW
BEGIN
    DECLARE min_inv DECIMAL(15,2);
    DECLARE max_inv DECIMAL(15,2);

    -- Get the investor's preferred investment range
    SELECT min_investment, max_investment
    INTO min_inv, max_inv
    FROM Investor
    WHERE investor_id = NEW.investor_id;

    -- Check if the amount is outside the range
    IF NEW.amount < min_inv OR NEW.amount > max_inv THEN
        -- Signal an error and stop the INSERT
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Investment amount is outside the investor''s specified range.';
    END IF;
END$$

-- Reset delimiter
DELIMITER ;


-- ------------------------------------------------------
-- 6. DEMONSTRATION & REPORT QUERIES 
-- ------------------------------------------------------

/*
-- ---
-- A. DEMONSTRATING TRIGGERS
-- ---

-- 1. Demonstrate `trg_AfterInsertFundingRound`
-- Check funding for LearnSphere (startup_id = 2) before insert
SELECT name, funding FROM Startup WHERE startup_id = 2; -- Should be 2,000,000.00

-- Insert a new funding round (Investor 5: Sandeep, min 250k, max 8M)
INSERT INTO FundingRound (startup_id, investor_id, amount, date)
VALUES (2, 5, 1000000.00, '2025-10-24');

-- Check funding for LearnSphere (startup_id = 2) after insert
SELECT name, funding FROM Startup WHERE startup_id = 2; -- Should now be 3,000,000.00


-- 2. Demonstrate `trg_BeforeInsertFundingRound_CheckRange`
-- Check Investor 1 (Anil Kumar) range
SELECT name, min_investment, max_investment FROM Investor WHERE investor_id = 1; -- 100k to 5M

-- Try to insert a value BELOW the minimum (5,000.00)
-- This should FAIL and return an error
INSERT INTO FundingRound (startup_id, investor_id, amount, date)
VALUES (1, 1, 5000.00, '2025-10-25');

-- Try to insert a value ABOVE the maximum (6,000,000.00)
-- This should FAIL and return an error
INSERT INTO FundingRound (startup_id, investor_id, amount, date)
VALUES (1, 1, 6000000.00, '2025-10-25');

-- Try to insert a valid amount
-- This should SUCCEED
INSERT INTO FundingRound (startup_id, investor_id, amount, date)
VALUES (1, 1, 200000.00, '2025-10-25');

-- Check PaySwift's (startup_id = 1) new funding
SELECT name, funding FROM Startup WHERE startup_id = 1; -- Should be 700,000.00 (500k + 200k)


-- ---
-- B. DEMONSTRATING STORED PROCEDURES
-- ---

-- 1. Demonstrate `sp_CreatePitch`
-- Try to create a new pitch (Founder 3 to Investor 4)
CALL sp_CreatePitch(3, 4); -- Should return 'Pitch created successfully.'
SELECT * FROM PitchMatch WHERE founder_id = 3 AND investor_id = 4; -- Shows the new 'Pending' pitch

-- Try to create the same pitch again
-- This should FAIL and return an error
CALL sp_CreatePitch(3, 4);


-- 2. Demonstrate `sp_GetInvestorMatches`
-- Get matches for Arjun Mehta (Founder 1), who owns PaySwift (FinTech)
CALL sp_GetInvestorMatches(1);
-- Should return investors who like FinTech (like Alok Jain)
-- but NOT investors already pitched (like Anil Kumar or Nisha Shah).

-- Get matches for Sneha Rao (Founder 2), who owns LearnSphere (EdTech)
CALL sp_GetInvestorMatches(2);
-- Should return investors who like EdTech but NOT Meera Iyer (already pitched).


-- ---
-- C. DEMONSTRATING FUNCTIONS
-- ---

-- 1. Demonstrate `fn_CheckInvestorApprovalStatus`
-- Check an approved investor (ID 1)
SELECT fn_CheckInvestorApprovalStatus(1); -- Returns 'Approved'

-- Create a new investor who is not yet approved
INSERT INTO Investor (name, email, password, funds, min_investment, max_investment)
VALUES ('Ravi Sharma', 'ravi@new.com', 'hash_ravi', 10000000.00, 50000.00, 500000.00);

-- Check the new investor's status
SELECT fn_CheckInvestorApprovalStatus(LAST_INSERT_ID()); -- Returns 'Pending Approval'


-- 2. Demonstrate `fn_GetFounderStartupCount`
-- Get count for a specific founder
SELECT fn_GetFounderStartupCount(1); -- Returns 1

-- Use in a larger query
SELECT name, email, fn_GetFounderStartupCount(founder_id) AS 'StartupCount'
FROM Founder;


-- ---
-- D. QUERIES FOR FINAL REPORT
-- ---

-- 1. JOIN Query: List all startups, their founders, and their domains.
SELECT
    s.name AS startup_name,
    f.name AS founder_name,
    d.d_name AS domain
FROM Startup s
JOIN Founder f ON s.founder_id = f.founder_id
JOIN Domain d ON s.domain_id = d.domain_id;

-- 2. AGGREGATE Query: Count the number of startups in each domain.
SELECT
    d.d_name,
    COUNT(s.startup_id) AS startup_count
FROM Domain d
LEFT JOIN Startup s ON d.domain_id = s.domain_id
GROUP BY d.d_name
ORDER BY startup_count DESC;

-- 3. NESTED (Subquery) Query: Find all investors who are interested in 'AI/ML'.
SELECT name, email, funds
FROM Investor
WHERE investor_id IN (
    SELECT investor_id
    FROM InvestorDomain
    WHERE domain_id = (SELECT domain_id FROM Domain WHERE d_name = 'AI/ML')
);

*/