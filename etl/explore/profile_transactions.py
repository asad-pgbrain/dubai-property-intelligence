"""
DLD Transactions CSV — Data Profiling Script
Purpose: Understand the data before loading into database
"""
import pandas as pd
from pathlib import Path

# Path to raw CSV
CSV_PATH = Path("data/raw/dld/transactions/2026/transactions-2026-10-03.csv")

print("=" * 70)
print("DLD TRANSACTIONS — DATA PROFILING")
print("=" * 70)

# Load CSV
print(f"\n📂 Loading: {CSV_PATH}")
df = pd.read_csv(CSV_PATH)

# Basic info
print(f"\n📊 SHAPE")
print(f"   Rows: {len(df):,}")
print(f"   Columns: {len(df.columns)}")

# Column list
print(f"\n📋 COLUMNS ({len(df.columns)})")
for i, col in enumerate(df.columns, 1):
    print(f"   {i:2}. {col}")

# Data types
print(f"\n🔢 DATA TYPES")
print(df.dtypes.to_string())

# Null counts
print(f"\n❓ NULL COUNTS")
null_counts = df.isnull().sum()
for col in df.columns:
    count = null_counts[col]
    pct = (count / len(df)) * 100
    status = "✅" if count == 0 else ("⚠️" if pct < 10 else "❌")
    print(f"   {status} {col:25} {count:>7,} nulls ({pct:5.2f}%)")

# Date range
print(f"\n📅 DATE RANGE")
df["INSTANCE_DATE"] = pd.to_datetime(df["INSTANCE_DATE"])
print(f"   Earliest: {df['INSTANCE_DATE'].min()}")
print(f"   Latest:   {df['INSTANCE_DATE'].max()}")

# Transaction value stats
print(f"\n💰 TRANSACTION VALUE (AED)")
print(df["TRANS_VALUE"].describe().to_string())

# Unique values for categorical columns
print(f"\n🔍 CATEGORICAL COLUMNS — UNIQUE VALUES")
categorical_cols = [
    "GROUP_EN", "PROCEDURE_EN", "IS_OFFPLAN_EN",
    "IS_FREE_HOLD_EN", "USAGE_EN", "PROP_TYPE_EN",
    "PROP_SB_TYPE_EN", "ROOMS_EN"
]
for col in categorical_cols:
    unique_vals = df[col].dropna().unique()
    print(f"\n   {col} ({len(unique_vals)} unique):")
    for val in unique_vals[:15]:  # first 15
        count = (df[col] == val).sum()
        print(f"      - {val!r} ({count:,})")
    if len(unique_vals) > 15:
        print(f"      ... and {len(unique_vals) - 15} more")

# Areas (top 15)
print(f"\n🏙️ TOP 15 AREAS")
top_areas = df["AREA_EN"].value_counts().head(15)
for area, count in top_areas.items():
    print(f"   {area:35} {count:,}")

# Duplicates check
print(f"\n🔁 DUPLICATES")
dup_trans = df["TRANSACTION_NUMBER"].duplicated().sum()
print(f"   Duplicate TRANSACTION_NUMBER: {dup_trans:,}")

# Data quality issues
print(f"\n⚠️ DATA QUALITY CHECKS")
negative_prices = (df["TRANS_VALUE"] <= 0).sum()
zero_area = (df["ACTUAL_AREA"] <= 0).sum()
print(f"   Negative/zero TRANS_VALUE: {negative_prices:,}")
print(f"   Negative/zero ACTUAL_AREA: {zero_area:,}")

print("\n" + "=" * 70)
print("✅ PROFILING COMPLETE")
print("=" * 70)
