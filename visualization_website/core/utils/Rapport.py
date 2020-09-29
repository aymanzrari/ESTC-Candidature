
import pandas as pd
import matplotlib.pyplot as plt

from core.utils.pg_database import get_connection


def candidat_data(select_columns, filters, title, group=[], op='', options={}):
    # send a request to database using the columns
    con = get_connection('127.0.0.1', 'postgres', '123123', 'est_candidature')

    sql = "SELECT "
    sql += ','.join(select_columns) +' FROM donneescandidat() ' + ("" if len(filters) == 0 else "WHERE " +
           ' AND '.join(''.join((key, val)) for key, val in filters.items()))

    print(sql)
    df = pd.read_sql_query(sql, con)
    if len(df) == 0:
        raise Exception("Aucune résultat")

    if len(group) != 0:
        df = df.groupby(group)

    if op != '':
        if op == 'count':
            df = df.count()

        elif op == 'sum':
            df = df.agg('sum')
        elif op == 'mean':
            df = df.mean()
    # if options['kind'] == 'pie':
    #     for col in select_columns:
    #         if col not in group:
    #             for index, row in df.iterrows():
    #                 print(row['codecandidat'])

    # Return plot
    if options['kind'] == 'bar':
        options['legend'] = None


    df.plot(**options)
    plt.title(title, weight='bold', size=20)


    plt.xlabel('')
    plt.ylabel('')
    plt.xticks(fontsize=14)
    plt.yticks(fontsize=16)

    con = None
    f = plt.figure(1)

    return f


def read_columns():

    cols = []
    print("Donner les colonnes: ")

    while True:
        inp = input()
        if inp == '':
            break

        cols.append(inp)

    return cols


def read_filters():
    filters = {}

    while True:
        print("Nom de colonne: ")

        colname = input()
        print("Condition ? (exemple = 'Homme'): ")
        filters[colname] = input()

        print("Ajouter une autre condition? (O/N)")
        if input().lower() != 'o':
            break

    return filters


def read_options():
    print("Donner les options: ")
    opts = {}
    while True:
        print("Type: (pie, bar..)")
        opts["kind"] = input().lower()

        print("Subplots (True, False): ")
        opts['subplots'] = input().lower()

        print("Figure size: ")
        opts['figsize'] = (int(input()), int(input()))

        if opts["kind"] == "pie":
            opts['autopct'] = '%1.0f%%'
            opts['pctdistance'] = 0.9

        elif opts['kind'] == "bar":
            print("Bar width: ")
            opts['width'] = float(input())
        return opts


if __name__ == '__main__':
    columns = []
    filters = []
    options = {}
    op = ''
    title = ''

    while True:
        choice = ""
        columns = []
        filters = {}
        group = []
        options = {}
        op = ''
        title = ''

        columns = read_columns()
        print("Ajouter des conditions? (O/N)")

        if input().lower() == "o":
            filters = read_filters()

        print("Titre: ")
        title = input()

        print("Group par des colones? (o/n)")
        if input().lower() == "o":
            while True:
                print("Donner le nom de la colonne: ")
                group.append(input())

                print("Ajouter une autre colonne?(O/N)")

                if input() != 'o':
                    break

        print("Operation (count, mean, sum): ")
        op = input().lower()

        options = read_options()

        chart = candidat_data(columns, filters, title, group, op, options)
        chart.show()
        print("Afficher une autre graph? (O/N)")
        if input().lower() != 'o':
            break
