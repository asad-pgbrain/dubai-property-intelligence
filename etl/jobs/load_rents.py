"""
DLD Rents ETL — Load CSV files into PostgreSQL

Flow:
  1. Find all rent CSVs in data/raw/dld/rents/2026/
  2. Register ingestion batch (audit)
  3. Load unique areas (already exist from transactions — reuse)
  4. Transform rows
  5. Load into core.rent_transactions
  6. Log results

Run: python etl/jobs/load_rents.py
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

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not set in .env")
    sys.exit(1)

RENTS_DIR = Path("data/raw/dld/rents/2026")


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


def main():
    print("=" * 70)
    print("DLD RENTS ETL")
    print("=" * 70)

    # 1. Find all CSV files
    csv_files = sorted(RENTS_DIR.glob("*.csv"))
    if not csv_files:
        print(f"ERROR: No CSV files found in {RENTS_DIR}")
        sys.exit(1)

    print(f"\n[1/7] Found {len(csv_files)} CSV files")

    # 2. Read all files and concatenate
    print(f"\n[2/7] Reading and concatenating all files...")
    dfs = []
    file_hashes = {}
    total_raw_rows = 0

    for f in csv_files:
        try:
            df = pd.read_csv(f)
            rows = len(df)
            total_raw_rows += rows
            dfs.append(df)
            file_hashes[f.name] = sha256_of_file(f)[:16]
            print(f"      {f.name}: {rows:,} rows")
        except Exception as e:
            print(f"      ERROR reading {f.name}: {e}")
            sys.exit(1)

    df = pd.concat(dfs, ignore_index=True)
    print(f"\n      Total rows (raw): {len(df):,}")

    # 3. Connect
    print(f"\n[3/7] Connecting to PostgreSQL...")
    engine = create_engine(DATABASE_URL)

    # 4. Register batch
    batch_id = uuid.uuid4()
    combined_hash = hashlib.sha256(
        "".join(file_hashes.values()).encode()
    ).hexdigest()

    with engine.begin() as conn:
        conn.execute(text("""
            INSERT INTO audit.ingestion_batches
              (batch_id, source_name, dataset_name, acquired_at,
               source_file_name, source_file_sha256, row_count, status)
            VALUES
              (:batch_id, 'Dubai Land Department', 'Rents',
               :acquired_at, :file_name, :file_hash, :row_count, 'in_progress')
        """), {
            "batch_id": str(batch_id),
            "acquired_at": datetime.now(),
            "file_name": f"{len(csv_files)} files (Jan-Oct 2026)",
            "file_hash": combined_hash,
            "row_count": len(df),
        })
    print(f"\n[4/7] Batch registered: {batch_id}")

    # 5. Area mapping (existing areas from transactions)
    print(f"\n[5/7] Mapping areas...")
    area_map = {}
    with engine.begin() as conn:
        result = conn.execute(text("SELECT area_id, normalized_name FROM core.areas"))
        for row in result:
            area_map[row.normalized_name] = row.area_id

    print(f"      Loaded {len(area_map)} existing areas")

    # Add any new areas from rents
    unique_areas = df["AREA_EN"].dropna().unique()
    new_areas = []
    for area_name in unique_areas:
        normalized = str(area_name).strip().upper()
        if normalized not in area_map:
            new_areas.append((area_name, normalized))

    if new_areas:
        print(f"      Adding {len(new_areas)} new areas from rents...")
        with engine.begin() as conn:
            for source_name, normalized in new_areas:
                result = conn.execute(text("""
                    INSERT INTO core.areas (source_area_name, normalized_name)
                    VALUES (:source, :normalized)
                    ON CONFLICT (normalized_name) DO UPDATE
                        SET updated_at = now()
                    RETURNING area_id
                """), {"source": source_name, "normalized": normalized})
                area_map[normalized] = result.scalar()

    print(f"      Total areas: {len(area_map)}")

    # 6. Transform
    print(f"\n[6/7] Transforming rows...")
    df["registration_date"] = pd.to_datetime(df["REGISTRATION_DATE"], errors="coerce").dt.date
    df["start_date"] = pd.to_datetime(df["START_DATE"], errors="coerce").dt.date
    df["end_date"] = pd.to_datetime(df["END_DATE"], errors="coerce").dt.date
    df["is_freehold_bool"] = df["IS_FREE_HOLD_EN"].apply(parse_bool_from_text)
    df["area_id"] = df["AREA_EN"].apply(
        lambda x: area_map.get(str(x).strip().upper()) if pd.notna(x) else None
    )

    # Filter invalid rows
    before = len(df)
    df = df.dropna(subset=["registration_date", "ANNUAL_AMOUNT"])
    df = df[df["ANNUAL_AMOUNT"] > 0]
    after = len(df)
    if before != after:
        print(f"      Dropped {before - after:,} invalid rows")

    records = []
    errors = 0
    for _, row in df.iterrows():
        try:
            records.append({
                "registration_date": row["registration_date"],
                "start_date": row.get("start_date") if pd.notna(row.get("start_date")) else None,
                "end_date": row.get("end_date") if pd.notna(row.get("end_date")) else None,
                "version": row.get("VERSION_EN") if pd.notna(row.get("VERSION_EN")) else None,
                "area_id": int(row["area_id"]) if pd.notna(row["area_id"]) else None,
                "contract_amount": float(row["CONTRACT_AMOUNT"]) if pd.notna(row.get("CONTRACT_AMOUNT")) else None,
                "annual_amount": float(row["ANNUAL_AMOUNT"]),
                "is_freehold": row["is_freehold_bool"],
                "property_size_sqm": float(row["ACTUAL_AREA"]) if pd.notna(row.get("ACTUAL_AREA")) and float(row.get("ACTUAL_AREA", 0) or 0) > 0 else None,
                "property_type": row.get("PROP_TYPE_EN") if pd.notna(row.get("PROP_TYPE_EN")) else None,
                "property_sub_type": row.get("PROP_SUB_TYPE_EN") if pd.notna(row.get("PROP_SUB_TYPE_EN")) else None,
                "rooms": row.get("ROOMS") if pd.notna(row.get("ROOMS")) else None,
                "usage": row.get("USAGE_EN") if pd.notna(row.get("USAGE_EN")) else None,
                "nearest_metro": row.get("NEAREST_METRO_EN") if pd.notna(row.get("NEAREST_METRO_EN")) else None,
                "nearest_mall": row.get("NEAREST_MALL_EN") if pd.notna(row.get("NEAREST_MALL_EN")) else None,
                "nearest_landmark": row.get("NEAREST_LANDMARK_EN") if pd.notna(row.get("NEAREST_LANDMARK_EN")) else None,
                "parking": str(row["PARKING"]) if pd.notna(row.get("PARKING")) else None,
                "unit_count": int(row["TOTAL_PROPERTIES"]) if pd.notna(row.get("TOTAL_PROPERTIES")) else None,
                "master_project": row.get("MASTER_PROJECT_EN") if pd.notna(row.get("MASTER_PROJECT_EN")) else None,
                "ingestion_batch_id": str(batch_id),
            })
        except Exception as e:
            errors += 1
            if errors <= 3:
                print(f"      Row error: {e}")

    print(f"      Prepared: {len(records):,} records (errors: {errors})")

    # 7. Insert in chunks
    print(f"\n[7/7] Inserting into core.rent_transactions...")
    insert_sql = text("""
        INSERT INTO core.rent_transactions
          (registration_date, start_date, end_date, version, area_id,
           contract_amount, annual_amount, is_freehold, property_size_sqm,
           property_type, property_sub_type, rooms, usage,
           nearest_metro, nearest_mall, nearest_landmark, parking,
           unit_count, master_project, ingestion_batch_id)
        VALUES
          (:registration_date, :start_date, :end_date, :version, :area_id,
           :contract_amount, :annual_amount, :is_freehold, :property_size_sqm,
           :property_type, :property_sub_type, :rooms, :usage,
           :nearest_metro, :nearest_mall, :nearest_landmark, :parking,
           :unit_count, :master_project, :ingestion_batch_id)
    """)

    inserted = 0
    chunk_size = 2000
    with engine.begin() as conn:
        for i in range(0, len(records), chunk_size):
            chunk = records[i:i + chunk_size]
            try:
                result = conn.execute(insert_sql, chunk)
                inserted += result.rowcount
                if (i // chunk_size) % 50 == 0:
                    print(f"      Progress: {min(i + chunk_size, len(records)):,} / {len(records):,}")
            except SQLAlchemyError as e:
                print(f"      Chunk error: {e}")
                break

    # Update batch status
    with engine.begin() as conn:
        conn.execute(text("""
            UPDATE audit.ingestion_batches
            SET status = 'completed', completed_at = now()
            WHERE batch_id = :batch_id
        """), {"batch_id": str(batch_id)})

    print("\n" + "=" * 70)
    print("ETL COMPLETE")
    print("=" * 70)
    print(f"  Files processed:  {len(csv_files)}")
    print(f"  Rows in CSVs:     {total_raw_rows:,}")
    print(f"  Inserted:         {inserted:,}")
    print(f"  Errors:           {errors:,}")
    print(f"  Batch ID:         {batch_id}")
    print("=" * 70)


if __name__ == "__main__":
    main()
