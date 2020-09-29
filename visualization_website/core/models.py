from django.db import models


class Ville(models.Model):
    idville = models.BigIntegerField(primary_key=True)
    nomville = models.CharField(max_length=100, blank=True, null=True)
    pays = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'villes'


class Candidat(models.Model):
    codecandidat = models.BigIntegerField(primary_key=True)
    nom = models.CharField(max_length=100, blank=True, null=True)
    prenom = models.CharField(max_length=100, blank=True, null=True)
    genre = models.CharField(max_length=20, blank=True, null=True)
    email = models.CharField(max_length=50, blank=True, null=True)
    nationalite = models.CharField(max_length=100, blank=True, null=True)
    adresse = models.CharField(max_length=500, blank=True, null=True)
    typebac = models.CharField(max_length=100, blank=True, null=True)
    mentionbac = models.CharField(max_length=100, blank=True, null=True)
    periodebac = models.CharField(max_length=100, blank=True, null=True)
    anneecandidature = models.BigIntegerField(blank=True, null=True)
    datenaissance = models.DateTimeField(blank=True, null=True)
    cne = models.BigIntegerField(blank=True, null=True)
    naissance = models.ForeignKey(Ville, models.DO_NOTHING, db_column='naissance', blank=True, null=True,
                                  related_name="naissance")
    residence = models.ForeignKey(Ville, models.DO_NOTHING, db_column='residence', blank=True, null=True,
                                  related_name="residence")

    class Meta:
        managed = False
        db_table = 'candidats'


class Telephone(models.Model):
    codecandidat = models.ForeignKey(Candidat, models.DO_NOTHING, db_column='codecandidat')
    numtel = models.CharField(max_length=25, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'telephones'


class Periode(models.Model):
    codeperiode = models.CharField(primary_key=True, max_length=100)
    intitule = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'periodes'


class DiplomeSup(models.Model):
    codediplome = models.BigIntegerField(primary_key=True)
    libelle = models.CharField(max_length=100, blank=True, null=True)
    etablissement = models.CharField(max_length=100, blank=True, null=True)
    ville = models.CharField(max_length=25, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'diplome_sup'


class CandidatDiplomeSup(models.Model):
    codecandidat = models.ForeignKey(Candidat, models.DO_NOTHING, db_column='codecandidat', blank=True, null=True)
    codediplome = models.ForeignKey(DiplomeSup, models.DO_NOTHING, db_column='codediplome', blank=True, null=True)
    dureeformation = models.CharField(max_length=500, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'candidat_diplome_sup'


class CandidatPeriode(models.Model):
    codecandidat = models.ForeignKey(Candidat, models.DO_NOTHING, db_column='codecandidat', blank=True, null=True)
    codeperiode = models.ForeignKey(Periode, models.DO_NOTHING, db_column='codeperiode', blank=True, null=True)
    periode = models.CharField(max_length=20, blank=True, null=True)
    note = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'candidat_periode'


class Filiere(models.Model):
    codefiliere = models.CharField(primary_key=True, max_length=100)
    dateaccreditation = models.DateField(blank=True, null=True)
    dureeaccreditation = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'filiere'


class Semestre(models.Model):
    idsemestre = models.CharField(primary_key=True, max_length=20)
    libellesemestre = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'semestre'


class Module(models.Model):
    codemodule = models.CharField(primary_key=True, max_length=50)
    libellemodule = models.CharField(max_length=100, blank=True, null=True)
    codefiliere = models.ForeignKey(Filiere, models.DO_NOTHING, db_column='codefiliere')
    idsemestre = models.ForeignKey(Semestre, models.DO_NOTHING, db_column='idsemestre')

    class Meta:
        managed = False
        db_table = 'module'


class Elementmodule(models.Model):
    libelleelementmodule = models.CharField(max_length=100, blank=True, null=True)
    coefficientelement = models.BigIntegerField(blank=True, null=True)
    codemodule = models.ForeignKey(Module, models.DO_NOTHING, db_column='codemodule')
    codeelementmodule = models.CharField(primary_key=True, max_length=20)

    class Meta:
        managed = False
        db_table = 'elementmodule'


class Passer(models.Model):
    codecandidat = models.ForeignKey(Candidat, null=True, on_delete=models.CASCADE)
    anneetestecrit = models.BigIntegerField(blank=True, null=True)
    libelle = models.CharField(max_length=100, blank=True, null=True)
    note = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'passer'
