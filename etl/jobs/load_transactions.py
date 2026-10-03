"""
DLD Transactions ETL — Load CSV into PostgreSQL
Run: python etl/jobs/load_transactions.py
"""
import hashlib
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# ---------- CONFIG ----------
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not set in .env")
    sys.exit(1)

CSV_PATH = Path("data/raw/dld/transactions/2026/transactions-2026-10-03.csv")


# ---------- HELPERS ----------
def sha256_of_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def parse_bool_from_text(value):
    if pd.isna(value):
        return None
    if value == "Free Hold":
        return True
    if value == "Non Free Hold":
        return False
    return None


# ---------- MAIN ----------
def main():
    print("=" * 70)
    print("DLD TRANSACTIONS ETL")
    print("=" * 70)

    # 1. Read CSV
    print(f"\n[1/8] Reading CSV: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    print(f"      Rows: {len(df):,}")

    # 2. Hash
    file_hash = sha256_of_file(CSV_PATH)
    print(f"      SHA256: {file_hash[:16]}...")

    # 3. Connect
    print(f"\n[2/8] Connecting to PostgreSQL...")
    engine = create_engine(DATABASE_URL)

    # 4. Register batch
    batch_id = uuid.uuid4()
    with engine.begin() as conn:
        conn.execute(text("""
            INSERT INTO audit.ingestion_batches
              (batch_id, source_name, dataset_name, acquired_at,
               source_file_name, source_file_sha256, row_count, status)
            VALUES
              (:batch_id, 'Dubai Land Department', 'Transactions',
               :acquired_at, :file_name, :file_hash, :row_count, 'in_progress')
        """), {
            "batch_id": str(batch_id),
            "acquired_at": datetime.now(),
            "file_name": CSV_PATH.name,
            "file_hash": file_hash,
            "row_count": len(df),
        })
    print(f"\n[3/8] Batch registered: {batch_id}")

    # 5. Load areas
    print(f"\n[4/8] Loading unique areas...")
    unique_areas = df["AREA_EN"].dropna().unique()
    area_map = {}
    with engine.begin() as conn:
        for area_name in unique_areas:
            normalized = str(area_name).strip().upper()
            result = conn.execute(text("""
                INSERT INTO core.areas (source_area_name, normalized_name)
                VALUES (:source, :normalized)
                ON CONFLICT (normalized_name) DO UPDATE
                    SET updated_at = now()
                RETURNING area_id
            """), {"source": area_name, "normalized": normalized})
            area_map[area_name] = result.scalar()
    print(f"      Loaded {len(area_map)} areas")

    # 6. Transform
    print(f"\n[5/8] Transforming rows...")
    df["transaction_date"] = pd.to_datetime(df["INSTANCE_DATE"]).dt.date
    df["is_freehold_bool"] = df["IS_FREE_HOLD_EN"].apply(parse_bool_from_text)
    df["area_id"] = df["AREA_EN"].map(area_map)

    records = []
    errors = 0
    for _, row in df.iterrows():
        try:
            records.append({
                "source_transaction_number": str(row["TRANSACTION_NUMBER"]),
                "transaction_date": row["transaction_date"],
                "transaction_type": row.get("GROUP_EN"),
                "transaction_sub_type": row.get("PROCEDURE_EN"),
                "is_offplan": row.get("IS_OFFPLAN_EN"),
                "is_freehold": row["is_freehold_bool"],
                "usage": row.get("USAGE_EN"),
                "area_id": int(row["area_id"]) if pd.notna(row["area_id"]) else None,
                "property_type": row.get("PROP_TYPE_EN"),
                "property_sub_type": row.get("PROP_SB_TYPE_EN") if pd.notna(row.get("PROP_SB_TYPE_EN")) else None,
                "amount": float(row["TRANS_VALUE"]) if pd.notna(row["TRANS_VALUE"]) else None,
                "transaction_size_sqm": float(row["PROCEDURE_AREA"]) if pd.notna(row["PROCEDURE_AREA"]) else None,
                "property_size_sqm": float(row["ACTUAL_AREA"]) if pd.notna(row["ACTUAL_AREA"]) else None,
                "rooms": row.get("ROOMS_EN") if pd.notna(row.get("ROOMS_EN")) else None,
                "parking": str(row["PARKING"]) if pd.notna(row["PARKING"]) else None,
                "nearest_metro": row.get("NEAREST_METRO_EN") if pd.notna(row.get("NEAREST_METRO_EN")) else None,
                "nearest_mall": row.get("NEAREST_MALL_EN") if pd.notna(row.get("NEAREST_MALL_EN")) else None,
                "nearest_landmark": row.get("NEAREST_LANDMARK_EN") if pd.notna(row.get("NEAREST_LANDMARK_EN")) else None,
                "buyer_count": int(row["TOTAL_BUYER"]) if pd.notna(row["TOTAL_BUYER"]) else None,
                "seller_count": int(row["TOTAL_SELLER"]) if pd.notna(row["TOTAL_SELLER"]) else None,
                "master_project": row.get("MASTER_PROJECT_EN") if pd.notna(row.get("MASTER_PROJECT_EN")) else None,
                "ingestion_batch_id": str(batch_id),
            })
        except Exception as e:
            errors += 1
            if errors <= 3:
                print(f"      Row error: {e}")
    print(f"      Prepared: {len(records):,} records (errors: {errors})")

    # 7. Insert
    print(f"\n[6/8] Inserting into core.transactions...")
    insert_sql = text("""
        INSERT INTO core.transactions
          (source_transaction_number, transaction_date, transaction_type,
           transaction_sub_type, is_offplan, is_freehold, usage, area_id,
           property_type, property_sub_type, amount, transaction_size_sqm,
           property_size_sqm, rooms, parking, nearest_metro, nearest_mall,
           nearest_landmark, buyer_count, seller_count, master_project,
           ingestion_batch_id)
        VALUES
          (:source_transaction_number, :transaction_date, :transaction_type,
           :transaction_sub_type, :is_offplan, :is_freehold, :usage, :area_id,
           :property_type, :property_sub_type, :amount, :transaction_size_sqm,
           :property_size_sqm, :rooms, :parking, :nearest_metro, :nearest_mall,
           :nearest_landmark, :buyer_count, :seller_count, :master_project,
           :ingestion_batch_id)
        ON CONFLICT (source_transaction_number, transaction_date) DO NOTHING
    """)

    inserted = 0
    skipped = 0
    chunk_size = 1000
    with engine.begin() as conn:
        for i in range(0, len(records), chunk_size):
            chunk = records[i:i + chunk_size]
            try:
                result = conn.execute(insert_sql, chunk)
                inserted += result.rowcount
                skipped += len(chunk) - result.rowcount
                if (i // chunk_size) % 20 == 0:
                    print(f"      Progress: {min(i + chunk_size, len(records)):,} / {len(records):,}")
            except SQLAlchemyError as e:
                print(f"      Chunk error: {e}")

    # 8. Update batch
    print(f"\n[7/8] Updating batch status...")
    with engine.begin() as conn:
        conn.execute(text("""
            UPDATE audit.ingestion_batches
            SET status = 'completed', completed_at = now()
            WHERE batch_id = :batch_id
        """), {"batch_id": str(batch_id)})

    print(f"\n[8/8] DONE")
    print("=" * 70)
    print(f"  Rows in CSV:      {len(df):,}")
    print(f"  Inserted:         {inserted:,}")
    print(f"  Skipped (dupes):  {skipped:,}")
    print(f"  Errors:           {errors:,}")
    print(f"  Batch ID:         {batch_id}")
    print("=" * 70)


if __name__ == "__main__":
    main()
