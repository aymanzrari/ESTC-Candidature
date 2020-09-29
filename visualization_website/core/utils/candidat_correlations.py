import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import scipy.stats as scs

from visualization_website.core.utils.pg_database import get_connection


def correlation_matrix(sql, target_columns):
    con = get_connection('localhost', 'postgres', '123123', 'estc_candidatures')
    df = pd.read_sql_query(sql, con)
    df = set_categorials(df)

    for target in target_columns:
        df = df[pd.notnull(df[target])]

    # corr = df.corr()
    return df



    print("")


def create_sql(columns, target_columns, table, target_table):
    sql = "SELECT " + ','.join(columns) + ", " + ','.join(target_columns)
    sql += " FROM " + table + ' ' + table[0] + \
           ' INNER JOIN ' + target_table + ' ON ' + table[0] + '.codecandidat = ' + target_table + '.codecandidat'

    return sql


def contains_operator(string):
    ops = ('=', '<', '>', '<=', '>=')
    return string.startswith(ops)


def create_filters(filters):
    return ('' if len(filters) == 0 else " WHERE " + ''.join(' AND '.join(k + v if contains_operator(v)
                                                               else k + " ILIKE '%" + v + "%' " for k, v in
                                                               filters.items())))


def set_categorials(df):
    cols = df.select_dtypes(include='object').columns
    for index, row in df.iterrows():
        for col in cols:
            df[col] = df[col].astype('category').cat.codes

    return df



targets = ['moyenneannee']

sql = create_sql(['residence'], targets, 'donneescandidat()', 'resultatannee')

sql += create_filters({'anneedelib': '=2018'})


print(sql)
df = correlation_matrix(sql, targets)

print(chi_square_of_df_cols(df,'residence', targets[0]))
