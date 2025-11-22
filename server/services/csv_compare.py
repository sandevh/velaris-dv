import pandas as pd

async def compare_csv_files(file1, file2):
    df1 = pd.read_csv(file1.file)
    df2 = pd.read_csv(file2.file)

    # Find unmatched rows
    only_in_1 = df1.merge(df2, indicator=True, how="left").query('_merge == "left_only"')
    only_in_2 = df2.merge(df1, indicator=True, how="left").query('_merge == "left_only"')

    return {
        "rows_in_file1_not_in_file2": len(only_in_1),
        "rows_in_file2_not_in_file1": len(only_in_2),
    }
