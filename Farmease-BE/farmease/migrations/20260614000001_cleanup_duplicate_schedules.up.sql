-- Delete duplicate routine schedules, keeping only the OLDEST one per (title, category, frequency, start_time, id_cage, id_account)
-- Also delete all tasks that were generated from the deleted duplicate schedules
DELETE FROM operations.tasks
WHERE schedule_id IN (
    SELECT id FROM operations.routine_schedules
    WHERE id NOT IN (
        SELECT DISTINCT ON (title, category, frequency, COALESCE(start_time::TEXT, ''), COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''))
            id
        FROM operations.routine_schedules
        ORDER BY title, category, frequency, COALESCE(start_time::TEXT, ''), COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''), created_at ASC
    )
);

DELETE FROM operations.routine_schedules
WHERE id NOT IN (
    SELECT DISTINCT ON (title, category, frequency, COALESCE(start_time::TEXT, ''), COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''))
        id
    FROM operations.routine_schedules
    ORDER BY title, category, frequency, COALESCE(start_time::TEXT, ''), COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''), created_at ASC
);
