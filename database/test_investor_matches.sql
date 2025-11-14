USE PitchPalDB;

-- Check if your new investor exists and is approved
SELECT 
    i.investor_id,
    i.name,
    i.email,
    CASE 
        WHEN aia.investor_id IS NOT NULL THEN 'Approved'
        ELSE 'Not Approved'
    END AS approval_status
FROM Investor i
LEFT JOIN AdminInvestorApproval aia ON i.investor_id = aia.investor_id
WHERE i.name LIKE '%fintech%' OR i.email LIKE '%fintech%'
ORDER BY i.investor_id DESC;

-- Check what domains your new investor has
SELECT 
    i.investor_id,
    i.name,
    d.d_name AS domain_name
FROM Investor i
JOIN InvestorDomain id ON i.investor_id = id.investor_id
JOIN Domain d ON id.domain_id = d.domain_id
ORDER BY i.investor_id DESC
LIMIT 10;

-- Check Arjun Mehta's startups and domains
SELECT 
    s.startup_id,
    s.name AS startup_name,
    d.d_name AS domain_name,
    f.name AS founder_name
FROM Startup s
JOIN Domain d ON s.domain_id = d.domain_id
JOIN Founder f ON s.founder_id = f.founder_id
WHERE f.founder_id = 1;

-- Test the stored procedure for Arjun (Founder ID 1)
CALL sp_GetInvestorMatches(1);
