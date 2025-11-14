USE PitchPalDB;

-- Drop the old procedure
DROP PROCEDURE IF EXISTS sp_GetInvestorMatches;

-- Change delimiter for procedure creation
DELIMITER $$

-- Recreate the procedure with approval check
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

SELECT 'Stored procedure sp_GetInvestorMatches updated successfully!' AS status;
