"""
Dubai Property Intelligence - API
Main FastAPI application.
"""
import os
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("API starting...")
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("Database connection OK")
    yield
    print("API shutting down")


app = FastAPI(
    title="Dubai Property Intelligence API",
    version="0.1.0",
    description="Market data and analytics for Dubai real estate",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://172.31.249.248:3000",
        "https://dubai-property-intelligence-apps.vercel.app",
    ],
)

@app.get("/api/v1/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=503, detail=f"Database error: {e}")


@app.get("/api/v1/market/summary")
def market_summary(limit: int = Query(20, ge=1, le=100)):
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
            last_transaction
        FROM analytics.area_market_summary
        ORDER BY transaction_count DESC
        LIMIT :limit
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql, {"limit": limit}).mappings().all()
    return {
        "data": [dict(r) for r in rows],
        "count": len(rows),
        "source": {"name": "Dubai Land Department", "dataset": "Transactions"},
    }


@app.get("/api/v1/areas")
def list_areas(
    limit: int = Query(100, ge=1, le=500),
    min_transactions: int = Query(10, ge=1),
):
    sql = text("""
        SELECT
            area_name,
            SUM(transaction_count)::int AS total_transactions,
            ROUND(
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY median_price)::numeric
            )::bigint AS median_price_aed,
            ROUND(
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY median_price_sqft)::numeric
            )::bigint AS median_aed_sqft,
            MAX(last_transaction) AS last_transaction
        FROM analytics.area_market_summary
        WHERE property_type = 'Unit'
        GROUP BY area_name
        HAVING SUM(transaction_count) >= :min_transactions
        ORDER BY total_transactions DESC
        LIMIT :limit
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql, {
            "limit": limit,
            "min_transactions": min_transactions,
        }).mappings().all()
    return {
        "data": [dict(r) for r in rows],
        "count": len(rows),
        "source": {"name": "Dubai Land Department", "dataset": "Transactions"},
    }


@app.get("/api/v1/areas/{area_name}")
def area_detail(area_name: str):
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
        WHERE UPPER(TRIM(area_name)) = UPPER(TRIM(:area_name))
        ORDER BY transaction_count DESC
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql, {"area_name": area_name}).mappings().all()
    if not rows:
        raise HTTPException(status_code=404, detail=f"Area not found: {area_name}")
    return {
        "area": area_name,
        "data": [dict(r) for r in rows],
        "source": {"name": "Dubai Land Department", "dataset": "Transactions"},
    }


@app.get("/api/v1/reality-check")
def reality_check(
    area: str = Query(..., description="Area name, e.g., DUBAI MARINA"),
    property_type: Optional[str] = Query(None),
    rooms: Optional[str] = Query(None),
    size_sqm: Optional[float] = Query(None),
    asking_price: Optional[float] = Query(None),
):
    sql = text("""
        SELECT
            tier,
            comp_count,
            ROUND(median_price)::bigint AS median_price_aed,
            ROUND(p25_price)::bigint AS p25_price_aed,
            ROUND(p75_price)::bigint AS p75_price_aed,
            ROUND(median_price_sqft)::bigint AS median_aed_sqft,
            min_size_sqm,
            max_size_sqm,
            first_date,
            last_date
        FROM analytics.get_market_comps(
            :area, :property_type, :rooms, :size_sqm, 20, 5
        )
    """)
    with engine.connect() as conn:
        result = conn.execute(sql, {
            "area": area,
            "property_type": property_type,
            "rooms": rooms,
            "size_sqm": size_sqm,
        }).mappings().first()

    if not result:
        raise HTTPException(status_code=404, detail="No market data found")

    result = dict(result)
    tier = result["tier"]

    coverage_map = {1: "High", 2: "Medium", 3: "Medium", 4: "Limited"}
    coverage = coverage_map.get(tier, "Limited")

    response = {
        "input": {
            "area": area,
            "property_type": property_type,
            "rooms": rooms,
            "size_sqm": size_sqm,
            "asking_price": asking_price,
        },
        "market": result,
        "coverage": coverage,
        "tier_explanation": {
            1: "Exact match: same area, type, rooms, and similar size",
            2: "Same area, type, and rooms (any size)",
            3: "Same area and property type",
            4: "Area-wide fallback - limited comparability",
        }.get(tier, "Unknown"),
        "source": {"name": "Dubai Land Department", "dataset": "Transactions"},
    }

    if asking_price and result["median_price_aed"]:
        median = float(result["median_price_aed"])
        diff_pct = ((asking_price - median) / median) * 100
        response["comparison"] = {
            "asking_price": asking_price,
            "market_median": median,
            "diff_pct": round(diff_pct, 1),
            "diff_aed": round(asking_price - median),
        }

    return response

# Register routers
from .routes_market import router as market_router  # noqa: E402
app.include_router(market_router)

from .routes_compare import router as compare_router  # noqa: E402
app.include_router(compare_router)

from .routes_area_monthly import router as area_monthly_router  # noqa: E402
app.include_router(area_monthly_router)

from .routes_compare_monthly import router as compare_monthly_router  # noqa: E402
app.include_router(compare_monthly_router)
