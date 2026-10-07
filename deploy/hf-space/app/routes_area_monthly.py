"""
Area monthly trend endpoint
"""
from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from .main import engine

router = APIRouter(prefix="/api/v1", tags=["areas"])


@router.get("/areas/{area_name}/monthly")
def area_monthly_trend(area_name: str):
    """
    Monthly transaction trend for a specific area (Unit type only).
    Returns monthly counts, volume, and median price.
    """
    sql = text("""
        SELECT
            DATE_TRUNC('month', t.transaction_date)::date AS month,
            COUNT(*)::int AS transaction_count,
            ROUND(SUM(t.amount))::bigint AS volume_aed,
            ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric)::bigint AS median_price_aed
        FROM core.transactions t
        JOIN core.areas a ON t.area_id = a.area_id
        WHERE UPPER(TRIM(a.normalized_name)) = UPPER(TRIM(:area_name))
          AND t.transaction_type = 'Sales'
          AND t.amount > 0
        GROUP BY DATE_TRUNC('month', t.transaction_date)::date
        ORDER BY month
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql, {"area_name": area_name}).mappings().all()

    if not rows:
        raise HTTPException(status_code=404, detail=f"No monthly data for: {area_name}")

    return {
        "area": area_name,
        "data": [dict(r) for r in rows],
        "count": len(rows),
        "source": {"name": "Dubai Land Department", "dataset": "Transactions"},
    }
