import React, { Component } from 'react';
import { Select, Input, Segment, Form, Radio, Header, Button, Grid, Dropdown } from 'semantic-ui-react'
import axios from 'axios'
import { connect } from 'react-redux';
import Classes from "./styles.css"


let params;
const renderLabel = label => ({
    color: 'blue',
    content: `${label.text}`,
    icon: 'check',
});
const dureesformation = [
    {
        key: 1,
        text: 'Normal',
        value: 'Normale',
    },
    {
        key: 2,
        text: 'Redoublé 1 an',
        value: 'redouble 1 an'
    },
    {
        key: 3,
        text: 'Redoublé 2 ans ou plus',
        value: 'redouble 2 ans ou plus'
    }
];
const Genre = [
    { key: 'm', text: 'Homme', value: 'homme' },
    { key: 'f', text: 'Femme', value: 'femme' },
]
const mentionsbac = [
    {
        key: 1,
        text: 'Passable',
        value: 'Passable'
    },
    {
        key: 2,
        text: 'Assez Bien',
        value: 'Assez Bien'
    },

    {
        key: 3,
        text: 'Bien',
        value: 'Bien'
    },
    {
        key: 4,
        text: 'Tres Bien',
        value: 'Tres Bien'
    },
];
const algo = [
    { key: 'a', text: 'Arbre de décision', value: "decision_tree" },
    { key: 'b', text: "Forêt d'arbres décisionnels", value: "random_forest" },
    { key: 'c', text: 'Machine à vecteurs de support', value: 'svm' },
    { key: 'd', text: 'Classification naïve bayésienne', value: 'naive_bayes' },
    { key: 'e', text: 'Régression linéaire multiple', value: 'multiple_linear' },
];
const kernel = [
    { key: 'a', text: 'linear', value: "linear" },
    { key: 'b', text: 'polynomial', value: "polynomial" },
    { key: 'c', text: 'gaussian', value: "gaussian" },
    { key: 'd', text: 'sigmoid', value: "sigmoid" },
];
const fields = [
    { key: 'a', text: 'Genre', value: 'genre' },
    { key: 'b', text: 'Age', value: 'age' },
    { key: 'c', text: 'Type Bac', value: 'typebac' },
    { key: 'd', text: 'Mention bac', value: 'mentionbac' },
    { key: 'f', text: 'Durée formation', value: 'dureeformation' },
    { key: 'g', text: 'Moyenne formation', value: 'moyformation' },
    { key: 'h', text: 'Moyenne préselection', value: 'excel' },
    { key: 'i', text: 'Moyenne concours', value: 'concours' },
];
class MachineLearning extends Component {

    constructor(props) {
        super(props);
        this.state = {
            algorithme: null,
            target: null,
            show: false,
            selected_columns: [],
            group_columns: [],
            kernel: null,
            NombreArbre: null,
            DataJson: null,
            candidats: [],
            listDescription: [],
            typesbac: [],
        }
    }
    async componentDidMount() {
        const filterdata = await axios.get('http://localhost:8000/filters/');
        this.setState({ typesbac: filterdata.data.typesbac });
    }
    formatOptions = (values) => {
        let opts = values.map(value => (
            {
                key: value,
                value: value,
                text: value
            }
        ));
        return opts;
    };
    onKernelChange = (e, { value }) => {
        this.setState({
            kernel: value,
        });
    }
    onOptionChange = (ev, el) => {
        this.setState({ [el.name]: el.value }, () => {
            if (el.name === 'selected_columns') {
                const options = el.options;
                this.state.group_columns.length = 1;
                let opts = [
                    {
                        key: -1,
                        text: "Aucun",
                        value: "-1"
                    }
                ];
                if (this.state.selected_columns.indexOf(this.state.count_column) === -1) {
                    this.setState({ count_column: null });
                }
                options.map(opt => {
                    if (this.state.selected_columns.indexOf(opt.value) > -1) {
                        opts.push(
                            {
                                key: opt.key,
                                text: opt.text,
                                value: opt.value
                            }
                        );
                    }
                    return null;
                });
                this.setState({ group_columns: opts });
            }
        });
    };
    onChangeAlgoHundler = (e, { value }) => {
        this.setState({
            algorithme: value,
        });
        if (value === 'decision_tree' || value === "random_forest" || value === "svm"
            || value === "naive_bayes")
            this.setState({ target: "mentionannee" });
        else if (value === "multiple_linear")
            this.setState({ target: "moyenneannee" });
        this.setState({ show: true });
    };
    onChangeNombreArbre = (e, { value }) => {
        this.setState({
            NombreArbre: value,
        });
    };
    onShow = () => {
        let features = this.state.selected_columns
        this.setState({ genreShow: false })
        this.setState({ ageShow: false })
        this.setState({ typedebacShow: false })
        this.setState({ mentionShow: false })
        this.setState({ durreShow: false })
        this.setState({ moyShow: false })
        this.setState({ excelShow: false })
        this.setState({ ConcoursShow: false })
        this.setState({ showHeader: false })
        for (let i = 0; i < features.length; i++) {
            this.setState({ showHeader: true })
            if (features[i] === 'genre')
                this.setState({ genreShow: true })
            if (features[i] === 'age')
                this.setState({ ageShow: true })
            if (features[i] === 'typebac')
                this.setState({ typedebacShow: true })
            if (features[i] === 'mentionbac')
                this.setState({ mentionShow: true })
            if (features[i] === 'dureeformation')
                this.setState({ durreShow: true })
            if (features[i] === 'moyformation')
                this.setState({ moyShow: true })
            if (features[i] === 'excel')
                this.setState({ excelShow: true })
            if (features[i] === 'concours')
                this.setState({ ConcoursShow: true })
        }
    }
    onSubmit = () => {
        const params = {};
        if (this.state.algorithme === "decision_tree") {
            params['nb_arbres'] = this.state.NombreArbre;
        }
        else if (this.state.algorithme === "svm") {
            params['kernel'] = this.state.kernel;
        }
        const postData = {
            algorithm: this.state.algorithme,
            features: this.state.selected_columns,
            target: this.state.target,
            JsonData: this.state.DataJson,
            candidat: this.state.listDescription,
            params,
        };
        console.log(postData);
        axios.post('http://localhost:8000/predict/', postData)
            .then(resp => console.log(resp))
            .catch(err => console.log(err));
    };
    onCandidatChange = (e, el) => {
        const candidats = Object.assign({}, this.state.candidats);
        const listDescription = this.state.listDescription;

        const val = el.value;
        const name = el.name;
        const filterText = el.title;

        for (let i in listDescription) {
            if (listDescription[i].key === filterText) {
                listDescription.splice(i, 1);
                break;
            }
        }

        if (val === "") {
            delete candidats[name];

        }
        else {
            candidats[name] = val;
            listDescription.push({ key: filterText, value: val })
        }

        this.setState({ candidats: candidats, listDescription: listDescription });
        console.log(this.state.listDescription)
    };

    render() {
        const { algorithme } = this.state;
        if (algorithme === "random_forest")
            params = <div>
                <Form.Group>
                    <Form.Field>
                        <Header as='h3' style={{ color: "#009688", 'font-family': "Times new Roman" }}>Entrer Votre Nombre d'arbre : </Header>
                        <Input placeholder="Nombre d'arbre" type="number" onChange={this.onChangeNombreArbre.bind(this)} />
                    </Form.Field>
                </Form.Group>
            </div>;
        else if (algorithme === 'svm')
            params = <div>
                <Header as='h3' style={{ color: "#009688", 'font-family': "Times new Roman" }}>Selectionner Votre Kernel:</Header>
                <Form.Group>
                    <Form.Field>
                        <Select placeholder="Kernel" options={kernel} onChange={this.onKernelChange.bind(this)} />
                    </Form.Field>
                </Form.Group>
            </div>;
        else if (algorithme === "decision_tree" || algorithme === "naive_bayes" || algorithme === "multiple_linear")
            params = null
        return (
            <React.Fragment>
                <Form>
                    <Grid columns={3}>
                        <Grid.Column>
                            <Form.Field>
                                <Header as='h3' style={{ color: "#009688", 'font-family': "Times new Roman" }} >Sélectionner Votre Algorithme :</Header>
                                <Form.Group>
                                    <Select placeholder="Algorithme" options={algo} onChange={this.onChangeAlgoHundler.bind(this)} />
                                </Form.Group>
                            </Form.Field>
                        </Grid.Column>
                        <Grid.Column>
                            <Form.Field>
                                <Header as='h3' style={{ color: "#009688", 'font-family': "Times new Roman" }} >
                                    Choisir les colonnes :</Header>
                                <Form.Group widths='equal'>
                                    <Dropdown
                                        multiple
                                        selection
                                        width={16}
                                        onChange={this.onOptionChange.bind(this)}
                                        options={fields}
                                        placeholder="Choisir les colonnes"
                                        name="selected_columns"
                                        renderLabel={renderLabel} />
                                </Form.Group>
                            </Form.Field>
                        </Grid.Column>
                        {this.state.show ? <Grid.Column>
                            <Form.Field>
                                <Header as='h3' style={{ color: "#009688", 'font-family': "Times new Roman" }}>Cible :</Header>
                                <Segment compact>
                                    <Form.Field>
                                        <Radio toggle name={this.state.target} value={this.state.target} checked={this.state.target}
                                            label={this.state.target} onChange={this.onTargetClick} />
                                    </Form.Field>
                                </Segment>
                            </Form.Field>
                            <Form.Field>
                                <Button style={{ margin: "5px" }} loading={this.state.loading} color='teal' type='submit' onClick={this.onShow.bind(this)}>
                                    Envoyer </Button>
                            </Form.Field>
                        </Grid.Column> : null}
                    </Grid>
                    {params}
                    {this.state.showHeader ? <Header style={{ color: "#009688", 'font-family': "Times new Roman" }} as='h2'>
                        Saisir les information de candidat pour obtenir ça mention où ça moyenne : </Header> : null}
                    <Form.Group widths='equal'>
                        {this.state.genreShow ? <Form.Select title='Genre' fluid label='Genre' onChange={this.onCandidatChange} options={Genre}
                            placeholder='Genre' name="genre" value={this.state.genre} /> : null}
                        {this.state.ageShow ? <Form.Input title='Age' fluid label='Age' onChange={this.onCandidatChange}
                            placeholder='Age' name="age" value={this.state.age} /> : null}
                        {this.state.typedebacShow ? <Form.Select title='Type de Bac' fluid label='Type de Bac' onChange={this.onCandidatChange} options={this.formatOptions(this.state.typesbac)}
                            placeholder='Type de Bac' name="typebac" value={this.state.typebac} /> : null}
                        {this.state.mentionShow ? <Form.Select title='Mention de bac' fluid label='Mention de bac' onChange={this.onCandidatChange} options={mentionsbac}
                            placeholder='Mention de bac' name="mentionbac" value={this.state.mentionbac} /> : null}
                    </Form.Group>
                    <Form.Group widths='equal'>
                        {this.state.durreShow ? <Form.Select title='Durée De Formation' fluid label='Durée De Formation' onChange={this.onCandidatChange} options={dureesformation}
                            placeholder='Durée de Bac' name="dureeformation" value={this.state.dureeformation} /> : null}
                        {this.state.moyShow ? <Form.Input title='Moyenne de formation' fluid label='Moyenne de formation' onChange={this.onCandidatChange}
                            placeholder='Moyenne de formation' name="moyenneformation" value={this.state.moyenneformation} /> : null}
                        {this.state.excelShow ? <Form.Input title='Moyenne preselection' fluid label='Moyenne de preselection' onChange={this.onCandidatChange}
                            placeholder='Moyenne de preselection' name="moyennepreselection" value={this.state.moyennepreselection} /> : null}
                        {this.state.ConcoursShow ? <Form.Input title='Moyenne de concours' fluid label='Moyenne de concours' onChange={this.onCandidatChange}
                            placeholder='Moyenne de concours' name="moyenneconcours" value={this.state.moyenneconcours} /> : null}
                    </Form.Group>
                    <Form.Field>
                        {this.state.showHeader ? <Button loading={this.state.loading} color='teal' type='submit' onClick={this.onSubmit.bind(this)}>
                            Calculer
                                </Button> : null}
                    </Form.Field>
                </Form>
            </React.Fragment>
        );
    }
}
const mapStateToProps = state => {
    return {
        token: state.token
    };
};

export default connect(mapStateToProps)(MachineLearning);