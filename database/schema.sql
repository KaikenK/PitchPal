-- PitchPal Database Schema
-- Drop existing database and create fresh
DROP DATABASE IF EXISTS PitchPalDB;
CREATE DATABASE PitchPalDB;
USE PitchPalDB;

-- Domain Table
CREATE TABLE Domain (
    DomainID INT PRIMARY KEY AUTO_INCREMENT,
    DomainName VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Table
CREATE TABLE Admin (
    AdminID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Founder Table
CREATE TABLE Founder (
    FounderID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(100),
    Bio TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investor Table
CREATE TABLE Investor (
    InvestorID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(100),
    Bio TEXT,
    TotalInvestmentCapacity DECIMAL(15, 2) DEFAULT 0,
    IsApproved BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investor Domain Mapping (Many-to-Many)
CREATE TABLE InvestorDomain (
    InvestorID INT,
    DomainID INT,
    PRIMARY KEY (InvestorID, DomainID),
    FOREIGN KEY (InvestorID) REFERENCES Investor(InvestorID) ON DELETE CASCADE,
    FOREIGN KEY (DomainID) REFERENCES Domain(DomainID) ON DELETE CASCADE
);

-- Startup Table
CREATE TABLE Startup (
    StartupID INT PRIMARY KEY AUTO_INCREMENT,
    FounderID INT NOT NULL,
    DomainID INT NOT NULL,
    StartupName VARCHAR(100) NOT NULL,
    Description TEXT,
    FundingGoal DECIMAL(15, 2),
    CurrentFunding DECIMAL(15, 2) DEFAULT 0,
    Stage VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (FounderID) REFERENCES Founder(FounderID) ON DELETE CASCADE,
    FOREIGN KEY (DomainID) REFERENCES Domain(DomainID)
);

-- FundingRound Table
CREATE TABLE FundingRound (
    FundingRoundID INT PRIMARY KEY AUTO_INCREMENT,
    StartupID INT NOT NULL,
    InvestorID INT NOT NULL,
    Amount DECIMAL(15, 2) NOT NULL,
    RoundDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT,
    FOREIGN KEY (StartupID) REFERENCES Startup(StartupID) ON DELETE CASCADE,
    FOREIGN KEY (InvestorID) REFERENCES Investor(InvestorID) ON DELETE CASCADE
);

-- PitchMatch Table
CREATE TABLE PitchMatch (
    PitchMatchID INT PRIMARY KEY AUTO_INCREMENT,
    StartupID INT NOT NULL,
    InvestorID INT NOT NULL,
    Status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    PitchDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT,
    FOREIGN KEY (StartupID) REFERENCES Startup(StartupID) ON DELETE CASCADE,
    FOREIGN KEY (InvestorID) REFERENCES Investor(InvestorID) ON DELETE CASCADE
);

-- Message Table
CREATE TABLE Message (
    MessageID INT PRIMARY KEY AUTO_INCREMENT,
    SenderType ENUM('Founder', 'Investor') NOT NULL,
    SenderID INT NOT NULL,
    ReceiverType ENUM('Founder', 'Investor') NOT NULL,
    ReceiverID INT NOT NULL,
    MessageContent TEXT NOT NULL,
    IsModerated BOOLEAN DEFAULT FALSE,
    SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AdminInvestorApproval Table
CREATE TABLE AdminInvestorApproval (
    ApprovalID INT PRIMARY KEY AUTO_INCREMENT,
    AdminID INT NOT NULL,
    InvestorID INT NOT NULL,
    ApprovalStatus ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    ApprovalDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID) ON DELETE CASCADE,
    FOREIGN KEY (InvestorID) REFERENCES Investor(InvestorID) ON DELETE CASCADE
);

-- MessageModeration Table
CREATE TABLE MessageModeration (
    ModerationID INT PRIMARY KEY AUTO_INCREMENT,
    MessageID INT NOT NULL,
    AdminID INT NOT NULL,
    Action ENUM('Approved', 'Flagged', 'Deleted') DEFAULT 'Approved',
    ModerationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Reason TEXT,
    FOREIGN KEY (MessageID) REFERENCES Message(MessageID) ON DELETE CASCADE,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID) ON DELETE CASCADE
);

-- Triggers
DELIMITER //

-- Trigger to validate funding amount range
CREATE TRIGGER trg_ValidateFundingAmount
BEFORE INSERT ON FundingRound
FOR EACH ROW
BEGIN
    IF NEW.Amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Funding amount must be positive';
    END IF;
    
    IF NEW.Amount > 10000000 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Funding amount exceeds maximum limit of 10,000,000';
    END IF;
END//

-- Trigger to update startup current funding after investment
CREATE TRIGGER trg_UpdateStartupFunding
AFTER INSERT ON FundingRound
FOR EACH ROW
BEGIN
    UPDATE Startup 
    SET CurrentFunding = CurrentFunding + NEW.Amount
    WHERE StartupID = NEW.StartupID;
END//

-- Trigger to auto-approve investor when admin approves
CREATE TRIGGER trg_AutoApproveInvestor
AFTER UPDATE ON AdminInvestorApproval
FOR EACH ROW
BEGIN
    IF NEW.ApprovalStatus = 'Approved' AND OLD.ApprovalStatus != 'Approved' THEN
        UPDATE Investor 
        SET IsApproved = TRUE
        WHERE InvestorID = NEW.InvestorID;
    END IF;
END//

DELIMITER ;

-- Stored Procedures
DELIMITER //

-- Get matched investors for a startup based on domain
CREATE PROCEDURE sp_GetInvestorMatches(IN p_StartupID INT)
BEGIN
    SELECT 
        i.InvestorID,
        i.Username,
        i.FullName,
        i.Email,
        i.TotalInvestmentCapacity,
        i.IsApproved,
        d.DomainName
    FROM Investor i
    JOIN InvestorDomain id ON i.InvestorID = id.InvestorID
    JOIN Startup s ON s.DomainID = id.DomainID
    JOIN Domain d ON d.DomainID = id.DomainID
    WHERE s.StartupID = p_StartupID
    AND i.IsApproved = TRUE
    ORDER BY i.TotalInvestmentCapacity DESC;
END//

-- Create a pitch match between startup and investor
CREATE PROCEDURE sp_CreatePitch(
    IN p_StartupID INT,
    IN p_InvestorID INT,
    IN p_Notes TEXT
)
BEGIN
    DECLARE v_DomainMatch INT;
    
    -- Check if investor and startup share a domain
    SELECT COUNT(*) INTO v_DomainMatch
    FROM Startup s
    JOIN InvestorDomain id ON s.DomainID = id.DomainID
    WHERE s.StartupID = p_StartupID
    AND id.InvestorID = p_InvestorID;
    
    IF v_DomainMatch = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Investor domain does not match startup domain';
    END IF;
    
    -- Create pitch match
    INSERT INTO PitchMatch (StartupID, InvestorID, Notes, Status)
    VALUES (p_StartupID, p_InvestorID, p_Notes, 'Pending');
    
    SELECT LAST_INSERT_ID() AS PitchMatchID;
END//

DELIMITER ;

-- Functions
DELIMITER //

-- Check investor approval status
CREATE FUNCTION fn_CheckInvestorApprovalStatus(p_InvestorID INT)
RETURNS VARCHAR(20)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_Status VARCHAR(20);
    
    SELECT COALESCE(ApprovalStatus, 'Pending') INTO v_Status
    FROM AdminInvestorApproval
    WHERE InvestorID = p_InvestorID
    ORDER BY ApprovalDate DESC
    LIMIT 1;
    
    RETURN v_Status;
END//

-- Get founder's startup count
CREATE FUNCTION fn_GetFounderStartupCount(p_FounderID INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_Count INT;
    
    SELECT COUNT(*) INTO v_Count
    FROM Startup
    WHERE FounderID = p_FounderID;
    
    RETURN v_Count;
END//

DELIMITER ;

-- Create indexes for performance
CREATE INDEX idx_startup_founder ON Startup(FounderID);
CREATE INDEX idx_startup_domain ON Startup(DomainID);
CREATE INDEX idx_fundinground_startup ON FundingRound(StartupID);
CREATE INDEX idx_fundinground_investor ON FundingRound(InvestorID);
CREATE INDEX idx_pitchmatch_startup ON PitchMatch(StartupID);
CREATE INDEX idx_pitchmatch_investor ON PitchMatch(InvestorID);
CREATE INDEX idx_message_sender ON Message(SenderType, SenderID);
CREATE INDEX idx_message_receiver ON Message(ReceiverType, ReceiverID);
