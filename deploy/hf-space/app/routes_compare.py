"""
Area comparison endpoint
"""
from typing import List
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text
from .main import engine

router = APIRouter(prefix="/api/v1", tags=["compare"])


@router.get("/compare")
def compare_areas(
    areas: List[str] = Query(..., description="List of area names to compare (2-4 recommended)"),
):
    """
    Compare market data for multiple areas side by side.
    Returns unit market stats for each area.
    """
    if len(areas) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 areas")
    if len(areas) > 6:
        raise HTTPException(status_code=400, detail="Maximum 6 areas at a time")

    # Normalize
    normalized = [a.strip().upper() for a in areas]

    sql = text("""
        SELECT
            area_name,
            property_type,
            transaction_count,
            ROUND(median_price)::bigint AS median_price_aed,
            ROUND(median_price_sqft)::bigint AS median_aed_sqft,
            ROUND(p25_price)::bigint AS p25_price_aed,
            ROUND(p75_price)::bigint AS p75_price_aed,
            data_coverage,
            first_transaction,
            last_transaction
        FROM analytics.area_market_summary
        WHERE UPPER(TRIM(area_name)) = ANY(:areas)
          AND property_type = 'Unit'
        ORDER BY transaction_count DESC
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql, {"areas": normalized}).mappings().all()

    found = {r["area_name"] for r in rows}
    missing = [a for a in areas if a.strip().upper() not in found]

    return {
        "data": [dict(r) for r in rows],
        "missing": missing,
        "count": len(rows),
        "source": {
            "name": "Dubai Land Department",
            "dataset": "Transactions",
        },
    }


@router.get("/areas/search")
def search_areas(
    q: str = Query("", description="Search query"),
    limit: int = Query(20, ge=1, le=50),
):
    """
    Search areas by name for autocomplete.
    """
    sql = text("""
        SELECT DISTINCT
            area_name,
            SUM(transaction_count)::int AS total_transactions
        FROM analytics.area_market_summary
        WHERE property_type = 'Unit'
          AND (:q = '' OR UPPER(area_name) LIKE UPPER(:q_like))
        GROUP BY area_name
        HAVING SUM(transaction_count) >= 20
        ORDER BY total_transactions DESC
        LIMIT :limit
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql, {
            "q": q,
            "q_like": f"%{q}%",
            "limit": limit,
        }).mappings().all()

    return {
        "data": [dict(r) for r in rows],
        "count": len(rows),
    }
