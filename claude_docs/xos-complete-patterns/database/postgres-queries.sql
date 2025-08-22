-- ===== POSTGRES QUERIES COMPLETE PATTERNS =====
-- This file contains EVERY PostgreSQL query pattern for XOS Framework
-- Follow PostgreSQL best practices and XOS data patterns EXACTLY

-- ⚠️ CRITICAL: Always use parameterized queries to prevent SQL injection
-- Always include client_id in WHERE clauses for multi-tenant data
-- Always use transactions for multi-step operations

-- ===== SECTION 1: BASIC CRUD PATTERNS =====

-- ✅ CORRECT: Basic SELECT with filtering and pagination
SELECT 
    id,
    first_name,
    last_name,
    email,
    phone,
    is_active,
    created_at,
    updated_at
FROM users 
WHERE client_id = @client_id 
    AND is_deleted = false
    AND (@search_text IS NULL OR 
         first_name ILIKE @search_pattern OR 
         last_name ILIKE @search_pattern OR 
         email ILIKE @search_pattern)
    AND (@department_id IS NULL OR department_id = @department_id)
    AND (@is_active IS NULL OR is_active = @is_active)
ORDER BY 
    CASE WHEN @sort_by = 'name' AND @sort_direction = 'asc' THEN first_name END ASC,
    CASE WHEN @sort_by = 'name' AND @sort_direction = 'desc' THEN first_name END DESC,
    CASE WHEN @sort_by = 'email' AND @sort_direction = 'asc' THEN email END ASC,
    CASE WHEN @sort_by = 'email' AND @sort_direction = 'desc' THEN email END DESC,
    CASE WHEN @sort_by = 'created_at' AND @sort_direction = 'asc' THEN created_at END ASC,
    CASE WHEN @sort_by = 'created_at' AND @sort_direction = 'desc' THEN created_at END DESC,
    created_at DESC -- Default sort
LIMIT @page_size OFFSET @offset;

-- ✅ CORRECT: Count query for pagination
SELECT COUNT(*) as total_count
FROM users 
WHERE client_id = @client_id 
    AND is_deleted = false
    AND (@search_text IS NULL OR 
         first_name ILIKE @search_pattern OR 
         last_name ILIKE @search_pattern OR 
         email ILIKE @search_pattern)
    AND (@department_id IS NULL OR department_id = @department_id)
    AND (@is_active IS NULL OR is_active = @is_active);

-- ✅ CORRECT: INSERT with RETURNING
INSERT INTO users (
    client_id,
    first_name,
    last_name,
    email,
    phone,
    department_id,
    role_id,
    is_active,
    created_at,
    created_by
) VALUES (
    @client_id,
    @first_name,
    @last_name,
    @email,
    @phone,
    @department_id,
    @role_id,
    @is_active,
    NOW(),
    @created_by
) RETURNING id, created_at;

-- ✅ CORRECT: UPDATE with audit fields
UPDATE users 
SET 
    first_name = @first_name,
    last_name = @last_name,
    email = @email,
    phone = @phone,
    department_id = @department_id,
    role_id = @role_id,
    is_active = @is_active,
    updated_at = NOW(),
    updated_by = @updated_by
WHERE id = @id 
    AND client_id = @client_id 
    AND is_deleted = false;

-- ✅ CORRECT: Soft DELETE
UPDATE users 
SET 
    is_deleted = true,
    deleted_at = NOW(),
    deleted_by = @deleted_by,
    updated_at = NOW(),
    updated_by = @deleted_by
WHERE id = @id 
    AND client_id = @client_id 
    AND is_deleted = false;

-- ===== SECTION 2: COMPLEX JOINS AND RELATIONSHIPS =====

-- ✅ CORRECT: Complex JOIN with multiple tables
SELECT 
    u.id,
    u.first_name || ' ' || u.last_name as full_name,
    u.email,
    u.phone,
    u.is_active,
    u.created_at,
    d.name as department_name,
    d.code as department_code,
    r.name as role_name,
    r.permissions,
    COUNT(p.id) as project_count,
    COALESCE(SUM(p.budget), 0) as total_budget,
    ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as skills,
    CASE 
        WHEN u.last_login_at > NOW() - INTERVAL '7 days' THEN 'active'
        WHEN u.last_login_at > NOW() - INTERVAL '30 days' THEN 'inactive'
        ELSE 'dormant'
    END as activity_status
FROM users u
LEFT JOIN departments d ON u.department_id = d.id AND d.client_id = u.client_id
LEFT JOIN roles r ON u.role_id = r.id AND r.client_id = u.client_id
LEFT JOIN project_users pu ON u.id = pu.user_id
LEFT JOIN projects p ON pu.project_id = p.id AND p.client_id = u.client_id AND p.is_deleted = false
LEFT JOIN user_skills us ON u.id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.id
WHERE u.client_id = @client_id 
    AND u.is_deleted = false
    AND (@department_id IS NULL OR u.department_id = @department_id)
    AND (@role_id IS NULL OR u.role_id = @role_id)
GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.is_active, u.created_at, 
         d.name, d.code, r.name, r.permissions, u.last_login_at
HAVING (@min_projects IS NULL OR COUNT(p.id) >= @min_projects)
ORDER BY u.last_name, u.first_name;

-- ✅ CORRECT: Hierarchical data with CTE (Common Table Expression)
WITH RECURSIVE department_hierarchy AS (
    -- Base case: top-level departments
    SELECT 
        id,
        name,
        parent_id,
        level = 0,
        path = ARRAY[name],
        id_path = ARRAY[id]
    FROM departments 
    WHERE parent_id IS NULL 
        AND client_id = @client_id 
        AND is_deleted = false
    
    UNION ALL
    
    -- Recursive case: child departments
    SELECT 
        d.id,
        d.name,
        d.parent_id,
        dh.level + 1,
        dh.path || d.name,
        dh.id_path || d.id
    FROM departments d
    INNER JOIN department_hierarchy dh ON d.parent_id = dh.id
    WHERE d.client_id = @client_id 
        AND d.is_deleted = false
        AND dh.level < 10 -- Prevent infinite recursion
)
SELECT 
    dh.*,
    REPEAT('  ', dh.level) || dh.name as indented_name,
    COUNT(u.id) as user_count,
    COUNT(CASE WHEN u.is_active THEN 1 END) as active_user_count
FROM department_hierarchy dh
LEFT JOIN users u ON dh.id = u.department_id AND u.client_id = @client_id AND u.is_deleted = false
GROUP BY dh.id, dh.name, dh.parent_id, dh.level, dh.path, dh.id_path, indented_name
ORDER BY dh.id_path;

-- ===== SECTION 3: AGGREGATION AND ANALYTICS =====

-- ✅ CORRECT: Window functions for analytics
SELECT 
    u.id,
    u.first_name || ' ' || u.last_name as full_name,
    d.name as department_name,
    u.salary,
    -- Ranking functions
    RANK() OVER (PARTITION BY u.department_id ORDER BY u.salary DESC) as salary_rank_in_dept,
    DENSE_RANK() OVER (ORDER BY u.salary DESC) as overall_salary_rank,
    ROW_NUMBER() OVER (PARTITION BY u.department_id ORDER BY u.created_at) as hire_order_in_dept,
    -- Analytical functions
    u.salary - LAG(u.salary) OVER (PARTITION BY u.department_id ORDER BY u.salary) as salary_diff_from_lower,
    LEAD(u.salary) OVER (PARTITION BY u.department_id ORDER BY u.salary) - u.salary as salary_diff_to_higher,
    -- Aggregate functions as window functions
    AVG(u.salary) OVER (PARTITION BY u.department_id) as avg_dept_salary,
    u.salary / AVG(u.salary) OVER (PARTITION BY u.department_id) as salary_ratio_to_avg,
    COUNT(*) OVER (PARTITION BY u.department_id) as dept_size,
    -- Cumulative calculations
    SUM(u.salary) OVER (PARTITION BY u.department_id ORDER BY u.created_at ROWS UNBOUNDED PRECEDING) as cumulative_salary_cost
FROM users u
JOIN departments d ON u.department_id = d.id
WHERE u.client_id = @client_id 
    AND u.is_deleted = false 
    AND u.salary IS NOT NULL
ORDER BY d.name, u.salary DESC;

-- ✅ CORRECT: Complex aggregation with ROLLUP and CUBE
SELECT 
    COALESCE(d.name, 'All Departments') as department,
    COALESCE(r.name, 'All Roles') as role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN u.is_active THEN 1 END) as active_count,
    AVG(u.salary) as avg_salary,
    MIN(u.salary) as min_salary,
    MAX(u.salary) as max_salary,
    SUM(u.salary) as total_salary,
    STDDEV(u.salary) as salary_stddev
FROM users u
LEFT JOIN departments d ON u.department_id = d.id AND d.client_id = u.client_id
LEFT JOIN roles r ON u.role_id = r.id AND r.client_id = u.client_id
WHERE u.client_id = @client_id 
    AND u.is_deleted = false
    AND u.salary IS NOT NULL
GROUP BY ROLLUP(d.name, r.name)
ORDER BY d.name NULLS LAST, r.name NULLS LAST;

-- ===== SECTION 4: JSON AND ARRAY OPERATIONS =====

-- ✅ CORRECT: JSON operations
SELECT 
    u.id,
    u.first_name || ' ' || u.last_name as full_name,
    u.preferences,
    -- JSON extraction
    u.preferences->>'theme' as preferred_theme,
    u.preferences->>'language' as preferred_language,
    CAST(u.preferences->>'notifications_enabled' AS BOOLEAN) as notifications_enabled,
    -- JSON array operations
    jsonb_array_length(u.preferences->'favorite_modules') as favorite_modules_count,
    u.preferences->'favorite_modules' as favorite_modules,
    -- JSON existence checks
    CASE WHEN u.preferences ? 'dashboard_config' THEN 'configured' ELSE 'default' END as dashboard_status
FROM users u
WHERE u.client_id = @client_id 
    AND u.is_deleted = false
    -- JSON filtering
    AND u.preferences->>'theme' = @theme_filter
    AND u.preferences->'favorite_modules' ? @module_filter
ORDER BY u.last_name, u.first_name;

-- ✅ CORRECT: Array operations
SELECT 
    u.id,
    u.first_name || ' ' || u.last_name as full_name,
    u.skills,
    -- Array operations
    array_length(u.skills, 1) as skill_count,
    CASE WHEN @required_skill = ANY(u.skills) THEN true ELSE false END as has_required_skill,
    u.skills && @skill_array as has_any_matching_skills,
    u.skills @> @skill_array as has_all_required_skills,
    -- Array aggregation
    string_agg(unnest, ', ') as skills_text
FROM users u,
     unnest(u.skills) as unnest
WHERE u.client_id = @client_id 
    AND u.is_deleted = false
    AND (@required_skill IS NULL OR @required_skill = ANY(u.skills))
GROUP BY u.id, u.first_name, u.last_name, u.skills
ORDER BY skill_count DESC, u.last_name;

-- ===== SECTION 5: FULL-TEXT SEARCH =====

-- ✅ CORRECT: Full-text search with ranking
SELECT 
    u.id,
    u.first_name || ' ' || u.last_name as full_name,
    u.email,
    u.bio,
    -- Search ranking
    ts_rank(
        to_tsvector('english', 
            COALESCE(u.first_name, '') || ' ' || 
            COALESCE(u.last_name, '') || ' ' || 
            COALESCE(u.email, '') || ' ' || 
            COALESCE(u.bio, '')
        ),
        plainto_tsquery('english', @search_text)
    ) as search_rank,
    -- Highlighted snippets
    ts_headline('english', u.bio, plainto_tsquery('english', @search_text)) as highlighted_bio
FROM users u
WHERE u.client_id = @client_id 
    AND u.is_deleted = false
    AND to_tsvector('english', 
        COALESCE(u.first_name, '') || ' ' || 
        COALESCE(u.last_name, '') || ' ' || 
        COALESCE(u.email, '') || ' ' || 
        COALESCE(u.bio, '')
    ) @@ plainto_tsquery('english', @search_text)
ORDER BY search_rank DESC, u.last_name, u.first_name;

-- ===== SECTION 6: ADVANCED PATTERNS =====

-- ✅ CORRECT: UPSERT (INSERT ... ON CONFLICT)
INSERT INTO user_preferences (
    user_id,
    client_id,
    key,
    value,
    updated_at
) VALUES (
    @user_id,
    @client_id,
    @preference_key,
    @preference_value,
    NOW()
)
ON CONFLICT (user_id, client_id, key) 
DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = EXCLUDED.updated_at
RETURNING id, CASE WHEN xmax = 0 THEN 'inserted' ELSE 'updated' END as action;

-- ✅ CORRECT: Bulk operations with VALUES
WITH new_users(first_name, last_name, email, department_id) AS (
    VALUES 
        (@first_name_1, @last_name_1, @email_1, @department_id_1),
        (@first_name_2, @last_name_2, @email_2, @department_id_2),
        (@first_name_3, @last_name_3, @email_3, @department_id_3)
)
INSERT INTO users (
    client_id,
    first_name,
    last_name,
    email,
    department_id,
    is_active,
    created_at,
    created_by
)
SELECT 
    @client_id,
    nu.first_name,
    nu.last_name,
    nu.email,
    nu.department_id,
    true,
    NOW(),
    @created_by
FROM new_users nu
WHERE NOT EXISTS (
    SELECT 1 FROM users u 
    WHERE u.email = nu.email 
        AND u.client_id = @client_id 
        AND u.is_deleted = false
)
RETURNING id, first_name, last_name, email;

-- ✅ CORRECT: Conditional aggregation and pivot
SELECT 
    d.name as department,
    COUNT(*) as total_users,
    COUNT(CASE WHEN u.is_active THEN 1 END) as active_users,
    COUNT(CASE WHEN NOT u.is_active THEN 1 END) as inactive_users,
    -- Role distribution
    COUNT(CASE WHEN r.name = 'Admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN r.name = 'Manager' THEN 1 END) as manager_count,
    COUNT(CASE WHEN r.name = 'User' THEN 1 END) as user_count,
    -- Salary statistics
    AVG(CASE WHEN u.is_active THEN u.salary END) as avg_active_salary,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY u.salary) as median_salary,
    -- Date-based aggregation
    COUNT(CASE WHEN u.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d,
    COUNT(CASE WHEN u.last_login_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as active_users_7d
FROM departments d
LEFT JOIN users u ON d.id = u.department_id AND u.client_id = d.client_id AND u.is_deleted = false
LEFT JOIN roles r ON u.role_id = r.id AND r.client_id = u.client_id
WHERE d.client_id = @client_id AND d.is_deleted = false
GROUP BY d.id, d.name
HAVING COUNT(*) > 0  -- Only departments with users
ORDER BY total_users DESC, d.name;

-- ===== SECTION 7: PERFORMANCE OPTIMIZATION =====

-- ✅ CORRECT: Index-friendly queries
-- Use leading columns of composite indexes
SELECT u.id, u.first_name, u.last_name, u.email
FROM users u
WHERE u.client_id = @client_id  -- First column of index
    AND u.is_deleted = false     -- Second column of index
    AND u.department_id = @department_id  -- Third column of index
    AND u.created_at >= @start_date       -- Can use index range scan
ORDER BY u.client_id, u.is_deleted, u.department_id, u.created_at DESC;

-- ✅ CORRECT: Avoiding function calls on indexed columns
-- Good: Use functional index or restructure query
SELECT u.id, u.first_name, u.last_name, u.email
FROM users u
WHERE u.client_id = @client_id
    AND u.email_lower = LOWER(@email_search)  -- Use pre-computed lowercase column
    AND u.is_deleted = false;

-- ✅ CORRECT: Efficient pagination with cursor
SELECT u.id, u.first_name, u.last_name, u.email, u.created_at
FROM users u
WHERE u.client_id = @client_id
    AND u.is_deleted = false
    AND (@cursor_date IS NULL OR u.created_at < @cursor_date)
    AND (@cursor_id IS NULL OR 
         (u.created_at = @cursor_date AND u.id < @cursor_id))
ORDER BY u.created_at DESC, u.id DESC
LIMIT @page_size;

-- ===== SECTION 8: STORED PROCEDURES =====

-- ✅ CORRECT: Stored procedure with error handling
CREATE OR REPLACE FUNCTION create_user_with_audit(
    p_client_id INTEGER,
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_email VARCHAR(255),
    p_department_id INTEGER,
    p_created_by INTEGER
) RETURNS TABLE(
    user_id INTEGER,
    result_code VARCHAR(10),
    result_message TEXT
) AS $$
DECLARE
    v_user_id INTEGER;
    v_email_exists BOOLEAN;
BEGIN
    -- Validate input
    IF p_first_name IS NULL OR LENGTH(TRIM(p_first_name)) = 0 THEN
        RETURN QUERY SELECT 0, 'ERROR'::VARCHAR, 'First name is required'::TEXT;
        RETURN;
    END IF;
    
    IF p_email IS NULL OR LENGTH(TRIM(p_email)) = 0 THEN
        RETURN QUERY SELECT 0, 'ERROR'::VARCHAR, 'Email is required'::TEXT;
        RETURN;
    END IF;
    
    -- Check for duplicate email
    SELECT EXISTS(
        SELECT 1 FROM users 
        WHERE client_id = p_client_id 
            AND email = p_email 
            AND is_deleted = false
    ) INTO v_email_exists;
    
    IF v_email_exists THEN
        RETURN QUERY SELECT 0, 'ERROR'::VARCHAR, 'Email already exists'::TEXT;
        RETURN;
    END IF;
    
    -- Create user
    INSERT INTO users (
        client_id, first_name, last_name, email, department_id,
        is_active, created_at, created_by
    ) VALUES (
        p_client_id, p_first_name, p_last_name, p_email, p_department_id,
        true, NOW(), p_created_by
    ) RETURNING id INTO v_user_id;
    
    -- Log audit
    INSERT INTO audit_log (
        client_id, table_name, record_id, action, 
        user_id, created_at, details
    ) VALUES (
        p_client_id, 'users', v_user_id, 'CREATE',
        p_created_by, NOW(), 
        jsonb_build_object(
            'first_name', p_first_name,
            'last_name', p_last_name,
            'email', p_email
        )
    );
    
    RETURN QUERY SELECT v_user_id, 'SUCCESS'::VARCHAR, 'User created successfully'::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 0, 'ERROR'::VARCHAR, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ❌ COMMON MISTAKES TO AVOID:
-- 1. Not parameterizing queries (SQL injection risk)
-- 2. Missing client_id in WHERE clauses (data leakage)
-- 3. Not using indexes effectively (performance issues)
-- 4. Using SELECT * instead of specific columns
-- 5. Not handling NULL values properly in comparisons
-- 6. Missing proper error handling in procedures
-- 7. Not using transactions for multi-step operations
-- 8. Inefficient pagination with OFFSET on large tables
-- 9. Not using appropriate data types for columns
-- 10. Missing proper constraints and foreign keys