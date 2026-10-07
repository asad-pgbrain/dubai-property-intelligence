"""
Market overview endpoints
"""
from fastapi import APIRouter
from sqlalchemy import text
from .main import engine

router = APIRouter(prefix="/api/v1/market", tags=["market"])


@router.get("/overview")
def market_overview():
    """
    Overall Dubai market snapshot:
    - Total transactions (Sales only)
    - Total volume AED
    - Median price
    - Date range
    - Top 10 areas
    - Monthly trend
    """
    with engine.connect() as conn:
        # Overall stats
        stats_sql = text("""
            SELECT
                COUNT(*)::int AS total_transactions,
                COALESCE(SUM(amount), 0)::bigint AS total_volume_aed,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)::numeric)::bigint AS median_price_aed,
                MIN(transaction_date) AS first_date,
                MAX(transaction_date) AS last_date,
                COUNT(DISTINCT area_id)::int AS areas_count
            FROM core.transactions
            WHERE transaction_type = 'Sales' AND amount > 0
        """)
        stats = dict(conn.execute(stats_sql).mappings().first())

        # Top 10 areas by transaction count
        top_sql = text("""
            SELECT
                a.normalized_name AS area_name,
                COUNT(*)::int AS transaction_count,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric)::bigint AS median_price_aed,
                ROUND(SUM(t.amount))::bigint AS volume_aed
            FROM core.transactions t
            JOIN core.areas a ON t.area_id = a.area_id
            WHERE t.transaction_type = 'Sales' AND t.amount > 0
            GROUP BY a.normalized_name
            ORDER BY transaction_count DESC
            LIMIT 10
        """)
        top_areas = [dict(r) for r in conn.execute(top_sql).mappings().all()]

        # Monthly trend
        trend_sql = text("""
            SELECT
                DATE_TRUNC('month', transaction_date)::date AS month,
                COUNT(*)::int AS transaction_count,
                ROUND(SUM(amount))::bigint AS volume_aed,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)::numeric)::bigint AS median_price_aed
            FROM core.transactions
            WHERE transaction_type = 'Sales' AND amount > 0
            GROUP BY DATE_TRUNC('month', transaction_date)::date
            ORDER BY month
        """)
        monthly_trend = [dict(r) for r in conn.execute(trend_sql).mappings().all()]

    return {
        "stats": stats,
        "top_areas": top_areas,
        "monthly_trend": monthly_trend,
        "source": {
            "name": "Dubai Land Department",
            "dataset": "Transactions",
        },
    }
