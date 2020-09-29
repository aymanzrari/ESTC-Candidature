from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from .query_generators import *
from .utils.pg_database import dictfetchall
from .models import Candidat, DiplomeSup, Module, Elementmodule, Passer
from .ml.ml_methods import *


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'expiresIn': 7200,
            'username': user.username
        })


class StatisticView(APIView):

    def post(self, request):
        columns = request.data['selected_columns']
        filters = request.data['filters']

        try:
            count_column = request.data['operation_column']
            columns.remove(count_column)
            sql = create_aggregation_sql(
                columns, filters, count_column, 'donneescandidat()', 'count', False)

        except Exception as e:
            sql = create_sql_candidats(columns, filters)
            print("Exception: " + str(e))

        cursor = connection.cursor()
        cursor.execute(sql)
        rows = dictfetchall(cursor)

        labels, counts = format_data(rows, 'count')

        return Response(
            {
                'labels': labels,
                'counts': counts
            }
        )


class ModuleStatisticsView(APIView):
    def get(self, request):
        modules = [{'codemodule': module.codemodule, 'libellemodule': module.libellemodule}
                   for module in Module.objects.order_by('codemodule').distinct('codemodule', 'libellemodule')]

        return Response({'modules': modules})

    def post(self, request):
        column = request.data['column']
        target = request.data['target']
        filters = request.data['filters']

        if target == 'moyennesemestre':
            target_table = 'resultatsemestre'
        elif target == 'moyenneannee':
            target_table = 'resultatannee'

        sql = create_notes_select(column, target, target_table)
        sql += create_filters(filters)

        cursor = connection.cursor()
        cursor.execute(sql)
        rows = dictfetchall(cursor)

        notes = [{'x': row[column], 'y': row[target]} for row in rows]
        sql = create_corr_select(column, target, target_table)

        sql += create_filters(filters)
        cursor = connection.cursor()
        cursor.execute(sql)
        corr = cursor.fetchone()

        return Response({
            'notes': notes,
            'corr': corr
        })


class PrecandidatStatistics(APIView):

    def get(self, request):
        modules = [{'codemodule': module.codemodule, 'libellemodule': module.libellemodule}
                   for module in Module.objects.order_by('codemodule').distinct('codemodule', 'libellemodule')]

        elmodules = [{'codeelementmodule': element.codeelementmodule,
                      'libelleelementmodule': element.libelleelementmodule} for element
                     in Elementmodule.objects.order_by('codeelementmodule').distinct('codeelementmodule',
                                                                                     'libelleelementmodule')]
        elconcours = [el['libelle'] for el in Passer.objects.all().values(
            'libelle').distinct().order_by('libelle')]

        annees = [el['anneecandidature'] for el in Candidat.objects.exclude(anneecandidature__isnull=True).values(
            'anneecandidature').distinct().order_by('anneecandidature')]

        return Response({
            'modules': modules,
            'elmodules': elmodules,
            'elconcours': elconcours,
            'annees': annees
        })

    def post(self, request):
        column = request.data['column']
        target = request.data['target']
        filters = request.data['filters']

        table = get_table_data_joined(column).get('table')
        column = get_table_data_joined(column).get('col')
        target_table = get_table_data_joined(target).get('table')
        target = get_table_data_joined(target).get('col')

        sql = create_sql(column, target, table, target_table)
        sql += create_filters(filters)

        cursor = connection.cursor()
        cursor.execute(sql)
        rows = dictfetchall(cursor)

        data = [{'x': row[column], 'y': row['target']} for row in rows]

        sql = create_sql_corr(column, target, table, target_table)
        sql += create_filters(filters)
        cursor = connection.cursor()
        cursor.execute(sql)
        corr = cursor.fetchone()

        return Response({'result': data, 'corr': corr})


class FiltersData(APIView):
    def get(self, request):
        diplomes = DiplomeSup.objects.all().values('libelle').distinct()
        typesbac = Candidat.objects.all().values('typebac').distinct()
        modules = Module.objects.all().values('codemodule', 'libellemodule').distinct()
        data = {
            'diplomes': [d['libelle'] for d in diplomes if d['libelle'] is not None],
            'typesbac': [typebac['typebac'] for typebac in typesbac if typebac['typebac'] is not None],
            'modules': modules
        }

        return Response(data)


class NotesStatistic(APIView):
    def post(self, request):
        field = request.data['field']
        filters = request.data['filters']
        op = request.data['op']
        table = get_table_data(field).get('table')
        column = get_table_data(field).get('col')

        table_alias = table[:2]
        join = table + ' ' + table_alias + ' INNER JOIN donneescandidat() c ON ' + \
            table_alias + '.codecandidat = c.codecandidat '

        sql = create_aggregation_sql(
            ['anneecandidature'], filters, column, join, op, False)

        cursor = connection.cursor()
        cursor.execute(sql)
        rows = dictfetchall(cursor)

        annees = [el['anneecandidature'] for el in Candidat.objects.exclude(anneecandidature__isnull=True)
                  .values('anneecandidature').distinct().order_by('anneecandidature')]

        data = []
        for annee in annees:
            found = False
            for row in rows:
                if annee == row['anneecandidature']:
                    data.append(row[column])
                    found = True
                    break
            if not found:
                data.append(0)

        return Response({'result': data})


class RapportCandidat(APIView):

    def post(self, request):
        flt = request.data['filters']
        fields = request.data['fields']

        filters = {}
        if len(flt) != 0:
            for k in flt.keys():
                key = 'don.{}'.format(k)
                filters[key] = flt[k]

        return_data = {}

        sql = create_aggregation_sql(
            '', {}, 'codecandidat', 'candidats', 'count', False)

        cursor = connection.cursor()
        cursor.execute(sql)

        nb_candidats = dictfetchall(cursor)

        return_data['nb_candidats'] = nb_candidats[0]['codecandidat']

        filters_string = create_filters(filters)

        if 'moyformation' in fields:
            col = get_table_data('moyformation')['col']
            table = get_table_data('moyformation')['table']

            sql = create_aggregation_sql('', filters, col, table, 'avg', True)

            cursor.execute(sql)
            res = dictfetchall(cursor)
            moyformation = res[0][col]
            return_data['moyformation'] = moyformation

        if 'excel' in fields:
            col = get_table_data('excel')['col']
            table = get_table_data('excel')['table']

            sql = create_aggregation_sql('', filters, col, table, 'avg', True)

            cursor.execute(sql)
            res = dictfetchall(cursor)
            excel = res[0][col]
            return_data['excel'] = excel

        if 'mentionbac' in fields:
            sql = create_aggregation_sql(
                ['mentionbac'], filters, 'codecandidat', 'donneescandidat() don', 'count', False)
            cursor.execute(sql)
            res = dictfetchall(cursor)
            data, labels = format_data(res, 'mentionbac')
            return_data['mentionbac'] = {'labels': labels, 'data': data}

        if 'typebac' in fields:
            sql = create_aggregation_sql(
                ['typebac'], filters, 'codecandidat', 'donneescandidat() don', 'count', False)
            cursor.execute(sql)
            res = dictfetchall(cursor)
            data, labels = format_data(res, 'typebac')
            return_data['typebac'] = {'labels': labels, 'data': data}

        if 'selmoyformation' in fields:
            col = get_table_data('moyformation')['col']
            sql = "SELECT avg({}) as {} FROM candidat_diplome_sup c " \
                  "INNER JOIN donneescandidat() don ON don.codecandidat=c.codecandidat " \
                  "INNER JOIN estselectionne es ON es.codecandidat=c.codecandidat".format(
                      col, col)
            sql += filters_string

            cursor.execute(sql)
            res = dictfetchall(cursor)
            moyformation = res[0][col]
            return_data['selmoyformation'] = moyformation

        if 'selexcel' in fields:
            col = get_table_data('excel')['col']

            sql = "SELECT avg({}) as {} FROM calculermoyenne c " \
                  "INNER JOIN donneescandidat() don ON don.codecandidat=c.codecandidat " \
                  "INNER JOIN estselectionne es ON es.codecandidat=c.codecandidat".format(
                      col, col)

            sql += filters_string

            cursor.execute(sql)
            res = dictfetchall(cursor)
            excel = res[0][col]
            return_data['selexcel'] = excel

        if 'selmentionbac' in fields:
            sql = create_aggregation_sql(
                ['mentionbac'], filters, 'estselectionne.codecandidat', 'estselectionne', 'count', True)
            cursor.execute(sql)
            res = dictfetchall(cursor)
            data, labels = format_data(res, 'mentionbac')
            return_data['selmentionbac'] = {'labels': labels, 'data': data}

        if 'seltypebac' in fields:
            sql = create_aggregation_sql(
                ['typebac'], filters, 'estselectionne.codecandidat', 'estselectionne', 'count', True)
            cursor.execute(sql)
            res = dictfetchall(cursor)
            data, labels = format_data(res, 'typebac')
            return_data['seltypebac'] = {'labels': labels, 'data': data}

        if 'seldiplome' in fields:
            sql = create_aggregation_sql(
                ['diplome'], filters, 'codecandidat', 'donneescandidat() don', 'count', False)

            cursor.execute(sql)
            res = dictfetchall(cursor)
            data, labels = format_data(res, 'diplome')
            return_data['seldiplome'] = {'labels': labels, 'data': data}

        if 'selmentiongl' in fields:
            sql = create_aggregation_sql(
                ['mentionannee'], filters, 'don.codecandidat', 'resultatannee', 'count', True)
            cursor.execute(sql)
            res = dictfetchall(cursor)
            data, labels = format_data(res, 'mentionannee')
            return_data['selmentiongl'] = {'labels': labels, 'data': data}

        if 'modules' in request.data and len(request.data['modules']) != 0:
            modules = request.data['modules']
            flt = filters.copy()
            flt['m.codemodule '] = (
                'in ' + str(tuple(modules)) if len(modules) > 1 else modules[0])

            del flt['anneecandidature']
            sql = "SELECT avg(notemodule) as nb, libellemodule, anneecandidature " \
                  "FROM obtenirmodule o INNER JOIN donneescandidat() don on don.codecandidat=o.codecandidat " \
                  "INNER JOIN module m ON o.codemodule=m.codemodule "
            sql += create_filters(flt)
            sql += " GROUP BY libellemodule, anneecandidature ORDER BY libellemodule, anneecandidature"
            cursor.execute(sql)
            res = dictfetchall(cursor)
            labels, data = format_data(res, 'nb')

            return_data['moduleannee'] = {'labels': labels, 'data': data}

        if 'diplomeannee' in fields:
            sql = create_aggregation_sql(
                ['anneecandidature'], filters, 'mentionannee', 'resultatannee', 'count', True)
            cursor.execute(sql)
            res = dictfetchall(cursor)
            data, labels = format_data(res, 'mentionannee')
            return_data['moduleannee'] = {'labels': labels, 'data': data}

        sql = "SELECT count(don.codecandidat) as nb from donneescandidat() don "
        sql += create_filters(filters)

        cursor.execute(sql)

        res = dictfetchall(cursor)

        candidats_preinscrits = res[0]['nb']
        return_data['preinscrit'] = candidats_preinscrits

        sql = create_generic_count_sql(
            'codecandidat', 'estselectionne', 'donneescandidat()')
        sql += filters_string
        cursor.execute(sql)
        res = dictfetchall(cursor)
        candidats_selectionne = res[0]['nb']
        return_data['preselect'] = candidats_selectionne

        sql = create_generic_count_sql(
            'codecandidat', 'resultat', 'donneescandidat()')
        sql += filters_string
        cursor.execute(sql)
        res = dictfetchall(cursor)
        passe_concours = res[0]['nb']
        return_data['passe_concours'] = passe_concours

        sql = create_aggregation_sql(
            ['estadmis.codecandidat'], filters, 'listeadmission', 'estadmis', '', True)
        cursor.execute(sql)
        res = dictfetchall(cursor)

        nb_principal = 0
        nb_attent = 0

        for row in res:
            if row['listeadmission'] == 'p':
                nb_principal += 1
            else:
                nb_attent += 1

        return_data['admis'] = {
            'nb_principal': nb_principal, 'nb_attent': nb_attent}

        return Response({'result': return_data})


class PredictCandidats(APIView):
    def post(self, request):
        algo = request.data['algorithm']
        features = request.data['features']
        params = request.data['params']
        target = request.data['target']
        cols = []
        tables = []

        candidats_data = ('genre', 'mentionbac', 'typebac',
                          'age', 'residence', 'dureeformation')

        for f in features:

            if f in candidats_data:
                cols.append('don.' + f)
                if 'donneescandidat()' not in tables:
                    tables.append('donneescandidat()')
            else:
                # Pour le libelle de diplome jointure de 2 tables
                if f == 'libelle':
                    cols.append(f)
                    tables.append('candidat_diplome_sup')
                    tables.append('diplome_sup')
                else:
                    cols.append(get_table_data(f)['col'])
                    table = get_table_data(f)['table']
                    if table not in tables:
                        tables.append(table)
        cols.append(target)
        table = get_table_data(target)['table']

        if table not in tables:
            tables.append(table)

        sql = select_multiple_join(cols, tables)

        df = pd.read_sql(sql, connection)

        t_df = transform(df)
        for i, col in enumerate(cols):
            split = col.split('.')
            cols[i] = split[1] if len(split) > 1 else split[0]
        if algo == 'decision_tree':
            model, p = decision_tree(t_df, cols, target)
        elif algo == 'random_forest':
            model, p = random_forest(
                t_df, cols, target, int(params['nb_arbres']))
        elif algo == 'svm':
            model, p = svm(t_df, cols, target, params['kernel'])
        elif algo == 'naive_bayes':
            model, p = naive_bayes(t_df, cols, target)
        elif algo == 'mlr':
            model, p = mlr(t_df, cols, target)


        candidat_data = request.data['candidat']
        values = dict()

        # structurer les donnees dans values pour creer un dataframe et obtenir les valeurs str, int, float
        for i, f in enumerate(features):
            if f != target:
                v = candidat_data[f]
                val = float(v) if isfloat(v) else int(v) if isint(v) else v
                values[cols[i]] = val
        # creer le dataframe pour l'encodage des variables categoriques
        data = pd.DataFrame([values])
        t_data = transform(data)

        # avoir la liste des données pour la prediction
        vals = []
        for i in t_data.iloc[0]:
            vals.append(i)
        pred = model.predict([vals])
        val = 0

        if target == 'mentionannee':
            for men in mention_codes:
                if men['code'] == pred:
                    val = men['text']
                    break
        else:
            val = pred

        return Response({'prediction': val, 'precision': p})


def isfloat(value):
    try:
        float(value)
        return True
    except ValueError:
        return False


def isint(value):
    try:
        int(value)
        return True
    except ValueError:
        return False
