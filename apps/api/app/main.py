"""
Dubai Property Intelligence — API

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
    # Startup
    print("🚀 API starting...")
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("✅ Database connection OK")
    yield
    # Shutdown
    print("👋 API shutting down")


app = FastAPI(
    title="Dubai Property Intelligence API",
    version="0.1.0",
    description="Market data and analytics for Dubai real estate",
    lifespan=lifespan,
)

# CORS — allow frontend later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Health Check
# ============================================================
@app.get("/api/v1/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=503, detail=f"Database error: {e}")


# ============================================================
# Market Summary (all areas)
# ============================================================
@app.get("/api/v1/market/summary")
def market_summary(
    limit: int = Query(20, ge=1, le=100),
):
    """
    Top areas by transaction count with median price and coverage.
    """
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
        "source": {
            "name": "Dubai Land Department",
            "dataset": "Transactions",
        },
    }


# ============================================================
# Area Detail
# ============================================================
@app.get("/api/v1/areas/{area_name}")
def area_detail(area_name: str):
    """
    Get market summary for a specific area (all property types).
    """
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
        WHERE area_name = UPPER(:area_name)
        ORDER BY transaction_count DESC
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql, {"area_name": area_name}).mappings().all()

    if not rows:
        raise HTTPException(
            status_code=404,
            detail=f"Area not found: {area_name}",
        )

    return {
        "area": area_name,
        "data": [dict(r) for r in rows],
        "source": {
            "name": "Dubai Land Department",
            "dataset": "Transactions",
        },
    }


# ============================================================
# Reality Check (flagship feature)
# ============================================================
@app.get("/api/v1/reality-check")
def reality_check(
    area: str = Query(..., description="Area name, e.g., DUBAI MARINA"),
    property_type: Optional[str] = Query(None, description="Unit, Building, Land"),
    rooms: Optional[str] = Query(None, description="Studio, 1 B/R, etc."),
    size_sqm: Optional[float] = Query(None, description="Property size in sqm"),
    asking_price: Optional[float] = Query(None, description="Asking price in AED"),
):
    """
    Property Reality Check — compare an asking price against market data.
    """
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

    # Coverage label based on tier
    coverage_map = {
        1: "High",
        2: "Medium",
        3: "Medium",
        4: "Limited",
    }
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
            4: "Area-wide fallback — limited comparability",
        }.get(tier, "Unknown"),
        "source": {
            "name": "Dubai Land Department",
            "dataset": "Transactions",
        },
    }

    # If asking price provided, add comparison
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
