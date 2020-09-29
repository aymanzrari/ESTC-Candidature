# Load libraries
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn import metrics, linear_model
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC


def transform(dataset):
    pd.options.mode.chained_assignment = None

    for column_name in dataset.columns:
        if dataset[column_name].dtype == 'int64' or dataset[column_name].dtype == 'float64':
            pass
        elif column_name == "genre":
            for i in range(len(dataset[column_name])):

                dataset[column_name][i] = dataset[column_name][i].lower()

                if dataset[column_name][i] == "homme":
                    dataset[column_name][i] = 0
                elif dataset[column_name][i] == "femme":
                    dataset[column_name][i] = 1

        elif column_name == "typebac":
            for i in range(len(dataset[column_name])):

                dataset[column_name][i] = dataset[column_name][i].lower()

                if dataset[column_name][i] == "bac sciences de la vie et de la terre":
                    dataset[column_name][i] = 0
                elif dataset[column_name][i] == "bac sciences physiques":
                    dataset[column_name][i] = 1
                elif dataset[column_name][i] == "bac sciences et technologies electrique":
                    dataset[column_name][i] = 2
                elif dataset[column_name][i] == "bac sciences maths a":
                    dataset[column_name][i] = 3
                elif dataset[column_name][i] == "bac sciences maths b":
                    dataset[column_name][i] = 4

        elif column_name == "mentionbac" or column_name == "mentionannee":
            for i in range(len(dataset[column_name])):

                dataset[column_name][i] = dataset[column_name][i].lower()

                if dataset[column_name][i] == "passable":
                    dataset[column_name][i] = 10
                elif dataset[column_name][i] == "assez bien":
                    dataset[column_name][i] = 12
                elif dataset[column_name][i] == "bien":
                    dataset[column_name][i] = 14
                elif dataset[column_name][i] == "tres bien":
                    dataset[column_name][i] = 16
                else:
                    dataset[column_name][i] = 18

        elif column_name == "dureeformation":
            for i in range(len(dataset[column_name])):

                dataset[column_name][i] = dataset[column_name][i].lower()

                if dataset[column_name][i] == "normale":
                    dataset[column_name][i] = 2
                else:
                    dataset[column_name][i] = 3

        else:
            pass

    dataset = dataset.apply(pd.to_numeric)

    return dataset


def retransform(data, column):
    if column == "genre":

        if data == 0:
            return "homme"
        elif data == 1:
            return "femme"

    elif column == "typebac":

        if data == 0:
            return "bac sciences de la vie et de la terre"
        elif data == 1:
            return "bac sciences physiques"
        elif data == 2:
            return "bac sciences et technologies electrique"
        elif data == 3:
            return "bac sciences maths a"
        elif data == 4:
            return "bac sciences maths b"

    elif column == "mentionbac" or column == "mentionannee":

        if data == 10:
            return "passable"
        elif data == 12:
            return "assez bien"
        elif data == 14:
            return "bien"
        elif data == 16:
            return "tres bien"
        else:
            return "excellent"

    elif column == "dureeformation":

        if data == 2:
            return "normale"
        else:
            return "redouble 1 an"


def decision_tree(dataset, inputs, target):

    X = dataset[inputs]  # Features
    y = target  # Target variable

    X_train, X_test, y_train, y_test = train_test_split(X.iloc[:, :-1], X.iloc[:, -1], test_size=0.2, random_state=1)

    model = DecisionTreeClassifier()

    model = model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    return model, metrics.accuracy_score(y_test, y_pred)


def random_forest(dataset, inputs, target, trees=5):
    X = dataset[inputs]  # Features
    y = target  # Target variable
    X_train, X_test, y_train, y_test = train_test_split(X.iloc[:, :-1], X.iloc[:, -1], test_size=0.2, random_state=1)

    sc = StandardScaler()
    X_train = sc.fit_transform(X_train)
    X_test = sc.transform(X_test)

    model = RandomForestClassifier(n_estimators=trees, random_state=0)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    return model, metrics.accuracy_score(y_test, y_pred)


def naive_bayes(dataset, inputs, target):
    X = dataset[inputs]  # Features
    y = target  # Target variable
    X_train, X_test, y_train, y_test = train_test_split(X.iloc[:, :-1], X.iloc[:, -1], test_size=0.2, random_state=1)

    model = MultinomialNB().fit(X_train, y_train)
    y_pred = model.predict(X_test)

    return model, metrics.accuracy_score(y_test, y_pred)


def svm(dataset, inputs, target, kernel='poly'):
    X = dataset[inputs]  # Features
    y = target  # Target variable
    X_train, X_test, y_train, y_test = train_test_split(X.iloc[:, :-1], X.iloc[:, -1], test_size=0.2, random_state=1)

    model = SVC(kernel=kernel, gamma='auto')
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    return model, metrics.accuracy_score(y_test, y_pred)


# def mlr(dataset, inputs, target):
#     X = dataset[inputs]  # Features
#     y = target  # Target variable
#     X_train, X_test, y_train, y_test = train_test_split(X.iloc[:, :-1], X.iloc[:, :-1], test_size=0.2, random_state=1)
#
#     model = linear_model.LinearRegression()
#     model.fit(X_train, y_train)
#     y_pred = model.predict(X_test)
#
#     return model, metrics.mean_squared_error(y_test, y_pred)


def mlr(dataset, inputs, target):
    X = dataset[inputs]  # Features
    y = target  # Target variable
    X_train, X_test, y_train, y_test = train_test_split(X.iloc[:, :-1], X.iloc[:, -1], test_size=0.2, random_state=1)

    model = linear_model.LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    return model, metrics.mean_squared_error(y_test, y_pred)


mention_codes = [
    {'text': "passable", 'code': 10},
    {'text': "assez bien", 'code': 12},
    {'text': "bien", 'code': 14},
    {'text': "tres bien", 'code': 16}
]
