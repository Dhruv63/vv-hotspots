-- scripts/016_crowd_intelligence.sql

-- Function to get historical crowd data
-- Returns aggregated check-ins by day of week and hour of day
CREATE OR REPLACE FUNCTION get_crowd_history(p_hotspot_id UUID, p_days_back INT DEFAULT 30)
RETURNS TABLE (
    day_of_week INT,
    hour_of_day INT,
    activity_level BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        EXTRACT(DOW FROM checked_in_at)::INT as dow,
        EXTRACT(HOUR FROM checked_in_at)::INT as hod,
        COUNT(*) as cnt
    FROM check_ins
    WHERE hotspot_id = p_hotspot_id
      AND checked_in_at > NOW() - (p_days_back || ' days')::INTERVAL
    GROUP BY 1, 2
    ORDER BY 1, 2;
END;
$$;

-- Function to get trending hotspots
-- Returns hotspots sorted by recent activity
CREATE OR REPLACE FUNCTION get_trending_hotspots(p_limit INT DEFAULT 5)
RETURNS TABLE (
    hotspot_id UUID,
    recent_checkins BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        h.id,
        COUNT(ci.id) as count
    FROM hotspots h
    JOIN check_ins ci ON h.id = ci.hotspot_id
    WHERE ci.created_at > NOW() - INTERVAL '2 hours'
    GROUP BY h.id
    ORDER BY count DESC
    LIMIT p_limit;
END;
$$;
