"""
Compare: monthly trend for multiple areas
"""
from typing import List
from fastapi import APIRouter, Query
from sqlalchemy import text
from .main import engine

router = APIRouter(prefix="/api/v1", tags=["compare"])


@router.get("/compare/monthly")
def compare_monthly(
    areas: List[str] = Query(..., description="Area names to compare"),
):
    """
    Monthly transaction trend for multiple areas.
    Returns one row per area+month.
    """
    if len(areas) < 2:
        raise ValueError("Provide at least 2 areas")
    if len(areas) > 6:
        raise ValueError("Maximum 6 areas")

    normalized = [a.strip().upper() for a in areas]

    sql = text("""
        SELECT
            a.normalized_name AS area_name,
            DATE_TRUNC('month', t.transaction_date)::date AS month,
            COUNT(*)::int AS transaction_count,
            ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric)::bigint AS median_price_aed
        FROM core.transactions t
        JOIN core.areas a ON t.area_id = a.area_id
        WHERE UPPER(TRIM(a.normalized_name)) = ANY(:areas)
          AND t.transaction_type = 'Sales'
          AND t.amount > 0
        GROUP BY a.normalized_name, DATE_TRUNC('month', t.transaction_date)::date
        ORDER BY a.normalized_name, month
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql, {"areas": normalized}).mappings().all()

    return {
        "data": [dict(r) for r in rows],
        "count": len(rows),
    }
