#!/usr/bin/env python
"""Import CSV data into database"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import argparse
from app.core.database import SessionLocal
from app.services.csv_importer import CSVImporter
from app.core.logging import logger

def main():
    parser = argparse.ArgumentParser(description='Import CSV contracts')
    parser.add_argument('--file', '-f', required=True, help='Path to CSV file')
    args = parser.parse_args()
    
    if not os.path.exists(args.file):
        print(f"Error: File {args.file} not found")
        sys.exit(1)
    
    db = SessionLocal()
    try:
        stats = CSVImporter.import_csv(db, args.file)
        print(f"\n{'='*40}")
        print(f"IMPORT STATISTICS")
        print(f"{'='*40}")
        print(f"Total rows processed: {stats['total_rows']}")
        print(f"Successfully imported: {stats['imported']}")
        print(f"Updated: {stats['updated']}")
        print(f"Skipped: {stats['skipped']}")
        print(f"Errors: {stats['errors']}")
        print(f"{'='*40}")
    except Exception as e:
        logger.error(f"Import failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()