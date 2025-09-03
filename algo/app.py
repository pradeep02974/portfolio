import pandas as pd
from tabulate import tabulate
from flask import Flask, request, render_template, send_file, Response
import os
from datetime import datetime
import uuid

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_EXTENSIONS = {'txt', 'csv'}

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_delimiter(filepath):
    """Detect the delimiter used in the file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            first_line = file.readline()
            for delimiter in [',', '\t', ';', '|']:
                if delimiter in first_line:
                    return delimiter
            return ','
    except UnicodeDecodeError:
        with open(filepath, 'r', encoding='latin1') as file:
            first_line = file.readline()
            for delimiter in [',', '\t', ';', '|']:
                if delimiter in first_line:
                    return delimiter
            return ','

def normalize_column_name(col):
    """Normalize column names for consistency."""
    return col.strip().upper().replace('.', '').replace(' ', '')

def process_file(filepath):
    # Detect delimiter
    delimiter = detect_delimiter(filepath)
    
    # Read file
    try:
        df = pd.read_csv(filepath, sep=delimiter, quotechar='"', encoding='utf-8', on_bad_lines='skip')
    except UnicodeDecodeError:
        df = pd.read_csv(filepath, sep=delimiter, quotechar='"', encoding='latin1', on_bad_lines='skip')
    
    # Normalize column names
    df.columns = [normalize_column_name(col) for col in df.columns]
    
    # Required columns
    required_cols = ["SYMBOL", "OPEN", "HIGH", "LOW", "PREVCLOSE"]
    cols_map = {
        "SYMBOL": ["SYMBOL", "STOCK", "TICKER", "CODE", "NAME"],
        "OPEN": ["OPEN", "OPENING", "OPENPRICE", "OPENINGPRICE"],
        "HIGH": ["HIGH", "HIGHPRICE", "DAILYHIGH", "MAX", "MAXIMUM"],
        "LOW": ["LOW", "LOWPRICE", "DAILYLOW", "MIN", "MINIMUM"],
        "PREVCLOSE": ["PREVCLOSE", "PREVIOUSCLOSE", "PREV", "CLOSE", "LAST", "PREVIOUSECLOSE"]
    }
    
    available_cols = {}
    for req_col in required_cols:
        for possible_name in cols_map[req_col]:
            if possible_name in df.columns:
                available_cols[req_col] = possible_name
                break
    
    missing_cols = [col for col in required_cols if col not in available_cols]
    if missing_cols:
        raise ValueError(f"Missing required columns: {', '.join(missing_cols)}. Available: {', '.join(df.columns)}")
    
    # Filter and rename
    df_small = df[[available_cols[col] for col in required_cols]].copy()
    df_small.columns = required_cols
    
    # Convert to numeric safely
    for col in required_cols[1:]:
        df_small[col] = pd.to_numeric(df_small[col], errors="coerce")
    
    matches = []
    column_names = ["OPEN", "HIGH", "LOW", "PREVCLOSE"]
    
    for idx, row in df_small.iterrows():
        values = [row[col] for col in column_names]
        
        # Find duplicates (2 or more same values)
        duplicates = {}
        for col_name, val in zip(column_names, values):
            if pd.notna(val):
                duplicates.setdefault(val, []).append(col_name)
        
        # Keep only values with 2 or more columns
        duplicates = {val: cols for val, cols in duplicates.items() if len(cols) >= 2}
        
        if duplicates:
            match_values_str = " & ".join([f"{val:.2f}" for val in duplicates.keys()])
            match_columns_str = " | ".join([", ".join(cols) for cols in duplicates.values()])
            row_match_count_str = " & ".join([str(len(cols)) for cols in duplicates.values()])
            
            matches.append([
                idx + 0,                  # S.N
                row["SYMBOL"],            # Symbol
                values,                   # All values
                match_values_str,         # Matched values
                match_columns_str,        # Matched columns
                row_match_count_str       # Match count
            ])
    
    # Sorting by match priority
    def sort_key(row):
        counts = [int(x) for x in row[5].split(" & ")]
        total_matches = sum(counts)
        max_value = float(row[3].split(" & ")[0])
        return (total_matches, max_value)
    
    matches.sort(key=sort_key, reverse=True)
    return matches

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return render_template('index.html', error='No file part')
    
    file = request.files['file']
    if file.filename == '':
        return render_template('index.html', error='No selected file')
    
    if file and allowed_file(file.filename):
        filename = f"{uuid.uuid4()}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        try:
            matches = process_file(filepath)
            
            if matches:
                table_txt = tabulate(
                    matches,
                    headers=["S.N", "SYMBOL", "Values [OPEN, HIGH, LOW, PREVCLOSE]", "Match Value(s)", "Match Columns", "Row Match Count"],
                    tablefmt="fancy_grid"
                )
                
                output_filename = f"matches_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
                output_filepath = os.path.join(OUTPUT_FOLDER, output_filename)
                
                with open(output_filepath, "w", encoding="utf-8") as f:
                    f.write(table_txt)
                
                return render_template('result.html', 
                                    table=table_txt, 
                                    matches_count=len(matches),
                                    download_file=output_filename)
            else:
                return render_template('result.html', table="No matching values found.", matches_count=0)
                
        except Exception as e:
            return render_template('index.html', error=f"Error processing file: {str(e)}")
    
    return render_template('index.html', error='Invalid file type')

@app.route('/download/<filename>')
def download_file(filename):
    filepath = os.path.join(OUTPUT_FOLDER, filename)
    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True)
    return Response("File not found", status=404)

if __name__ == '__main__':
    app.run(debug=True)
