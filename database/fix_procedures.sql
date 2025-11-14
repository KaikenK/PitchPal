USE PitchPalDB;

-- Drop existing procedures
DROP PROCEDURE IF EXISTS sp_CreatePitch;
DROP PROCEDURE IF EXISTS sp_GetInvestorMatches;

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

-- Reset delimiter
DELIMITER ;

SELECT 'All stored procedures recreated successfully!' AS status;
