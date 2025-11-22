import pandas as pd
from io import BytesIO

def read_csv(raw_bytes):
    """
    Reads a CSV file from bytes and returns a Pandas DataFrame
    """
    return pd.read_csv(BytesIO(raw_bytes))
