def get_table_data_joined(key):
    tables = {
        'excel': {'col': 'moyenne', 'table': 'calculermoyenne'},
        'concours': {'col': 'moyenneconcours', 'table': 'resultat'},
        'elconcours': {'col': 'note', 'table': 'passer'},
        'moyenneannee': {'col': 'moyenneannee', 'table': 'moyannee_candidat()'},
        'elmodule': {'col': 'note', 'table': 'elements_candidat()'},
        'module': {'col': 'notemodule', 'table': 'modules_candidat2()'},
        'moysemestre': {'col': 'moyennesemestre', 'table': 'resultatsemestre'}
    }

    return tables[key]


def get_table_data(key):
    tables = {
        'excel': {'col': 'moyenne', 'table': 'calculermoyenne'},
        'concours': {'col': 'moyenneconcours', 'table': 'resultat'},
        'elconcours': {'col': 'note', 'table': 'passer'},
        'moyenneannee': {'col': 'moyenneannee', 'table': 'resultatannee'},
        'mentionannee': {'col': 'moyenneannee', 'table': 'resultatannee'},
        'elmodule': {'col': 'note', 'table': 'obtenirelement'},
        'module': {'col': 'notemodule', 'table': 'obtenirmodule'},
        'moysemestre': {'col': 'moyennesemestre', 'table': 'resultatsemestre'},
        'moyformation': {'col': 'moyenneformation', 'table': 'candidat_diplome_sup'},
        'moyenneconcours': {'col': 'moyenneconcours', 'table': 'resultat'},
    }

    return tables[key]


def select_multiple_join(columns=[], tables=[]):
    select_cols = ','.join(columns)

    sql = "SELECT " + select_cols + ' FROM '
    join = ''
    alias = (tables[0] if tables[0] != 'donneescandidat()' else 'don')
    sql += tables[0] + " " + alias

    itter_table = tables[1:]

    if len(tables) > 1:
        for table in itter_table:
            table_alias = (table if table != 'donneescandidat()' else 'don')

            join += " INNER JOIN " + table + " " + table_alias +" on " + alias + ".codecandidat="
            join += table_alias + ".codecandidat"

    sql += join
    sql += " WHERE " + ' AND '.join([col + " is not null " for col in columns])
    return sql


def create_aggregation_sql(columns, filters, count_column, table, op, join_to_candidat):
    select_cols = ','.join(columns)
    alias = count_column.split('.')
    alias = alias[1] if len(alias) == 2 else alias[0]

    sql = "SELECT " + select_cols + (',' if len(columns) != 0 else '')
    if op == 'count':
        sql += 'COUNT(DISTINCT ' + count_column + ') as ' + alias
    elif op == 'avg':
        sql += 'AVG(' + count_column + ') as ' + alias
    elif op == 'max':
        sql += 'MAX(' + count_column + ') as ' + alias
    else:
        sql += count_column

    sql += " FROM " + table
    if join_to_candidat:
        sql += ' INNER JOIN donneescandidat() don on ' + table + '.codecandidat=don.codecandidat '
    sql += ('' if len(filters) == 0 else " WHERE "
                                         + ''.join(' AND '.join(k + v if contains_operator(v)
                                                                else k + " ILIKE '%" + v + "%' " for k, v in
                                                                filters.items())))
    if op in ('count', 'avg', 'max', 'min') and columns != '':
        sql += " GROUP BY " + select_cols
    if columns != '':
        sql += " ORDER BY " + ','.join(columns) if len(columns) != 0 else ''
    return sql


def format_data(result, key):
    values = []
    counts = []

    for data in result:
        counts.append(data[key])
        val = ', '.join(str(v) if v is not None else 'null' for k, v in data.items() if k != key)
        data.items()
        values.append(val)

    return values, counts


def create_notes_select(column, target_column, target_table):
    sql = "SELECT " + column + ", "
    sql += target_column + ' as ' + target_column
    sql += " FROM modules_candidat() mc " + \
           ' INNER JOIN ' + target_table + ' ON mc.codecandidat = ' + target_table + '.codecandidat'
    return sql


def create_corr_select(column, target_column, target_table):
    sql = "SELECT corr(" + column + ", " + target_column + ") as corr "

    sql += " FROM modules_candidat() mc " + \
           ' INNER JOIN ' + target_table + ' ON mc.codecandidat = ' + target_table + '.codecandidat'

    return sql


def create_sql(column, target_column, table, target_table):
    sql = "SELECT " + table[0] + "." + column + ',' + target_table[:3] + "." + target_column + " as target "
    sql += " FROM " + table + ' ' + table[0] + \
           ' INNER JOIN ' + target_table + " " + target_table[:3] + ' ON ' + table[0] + '.codecandidat = ' \
           + target_table[:3] + '.codecandidat'

    return sql


def create_generic_count_sql(column, table, target_table):
    sql = 'SELECT count(' + table[0] + '.' + column + ') as nb'
    sql += " FROM " + table + ' ' + table[0] + \
           ' INNER JOIN ' + target_table + " " + target_table[:3] + ' ON ' + table[0] + '.codecandidat = ' \
           + target_table[:3] + '.codecandidat'

    return sql


def create_sql_corr(column, target_column, table, target_table):

    sql = "SELECT corr(" + table[0] + "." + column + ", " + target_table[:3] + '.' + target_column + ") as corr "
    sql += " FROM " + table + ' ' + table[0] + \
           ' INNER JOIN ' + target_table + " " + target_table[:3] + ' ON ' + table[0] + '.codecandidat = ' \
           + target_table[:3] + '.codecandidat'

    return sql


def create_filters(filters):
    return ('' if len(filters) == 0 else " WHERE "
                                         + ''.join(' AND '.join(k + v if contains_operator(v)
                                                                else k + " ILIKE '%" + v + "%' " for k, v in
                                                                filters.items())))


def contains_operator(string):
    ops = ('=', '<', '>', '<=', '>=', 'in')
    return string.startswith(ops)


def remove_operator(string):
    ops = ('=', '<', '>', '<=', '>=', 'in')
    if string[:2] in ops:
        return string[2:]

    else:
        return string[1:]


def create_sql_candidats(columns, filters):
    select_cols = ''.join(','.join(col for col in columns))
    sql = "SELECT " + select_cols + (',' if len(columns) != 0 else '') \
          + " COUNT(codecandidat) as count FROM donneescandidat() " + \
          ('' if len(filters) == 0 else "WHERE "
                                        + ''.join(' AND '.join(k + v if contains_operator(v)
                                                               else k + " ILIKE '%" + v + "%'" for k, v in
                                                               filters.items())))
    sql += " GROUP BY " + select_cols if len(columns) != 0 else ''

    sql += " ORDER BY " + ','.join(col for col in columns) if len(columns) != 0 else ''

    return sql