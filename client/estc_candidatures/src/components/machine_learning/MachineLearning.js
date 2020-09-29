import React, { Component } from 'react';
import { Select, Input, Segment, Form, Radio, Header, Button, Grid, Dropdown } from 'semantic-ui-react'
import axios from 'axios'

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
    { key: 'e', text: 'Régression linéaire multiple', value: 'mlr' },
];
const kernel = [
    { key: 'a', text: 'linear', value: "linear" },
    { key: 'b', text: 'polynomial', value: "poly" },
    { key: 'c', text: 'gaussian', value: "rbf" },
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
            kernel: null,
            NombreArbre: null,
            candidats: {},
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
        const options = el.value;

        const candidats = Object.assign({}, this.state.candidats);
        for (let k in candidats) {
            if (options.indexOf(k) === -1) {
                delete candidats[k];
            }
        }
        this.setState({ selected_columns: options, candidats })

    };
    onChangeAlgoHundler = (e, { value }) => {
        this.setState({
            algorithme: value,
        });
        if (value === 'decision_tree' || value === "random_forest" || value === "svm"
            || value === "naive_bayes")
            this.setState({ target: "mentionannee" });
        else if (value === "mlr")
            this.setState({ target: "moyenneannee" });
        this.setState({ show: true });
    };
    onChangeNombreArbre = (e, { value }) => {
        this.setState({
            NombreArbre: value,
        });
    };
    featureExists = (f) => {
        const cols = this.state.selected_columns;
        for (let i in cols) {
            if (cols[i] === f)
                return true;
        }
        return false;
    };
    onSubmit = () => {

        const params = {};
        if (this.state.algorithme === "random_forest") {
            params['nb_arbres'] = this.state.NombreArbre;
        }
        else if (this.state.algorithme === "svm") {
            params['kernel'] = this.state.kernel;
        }
        const postData = {
            algorithm: this.state.algorithme,
            features: this.state.selected_columns,
            target: this.state.target,
            candidat: this.state.candidats,
            params,
        };
        console.log(this.state.candidats);
        axios.post('http://localhost:8000/predict/', postData)
            .then(resp => this.setState({ resultat: resp.data.prediction, precision: resp.data.precision }))
            .catch(err => console.log(err));
        this.setState({ resultatShow: true })
    };
    onCandidatChange = (e, el) => {
        const candidats = Object.assign({}, this.state.candidats);
        const name = el.name;
        const val = el.value;

        if (val === "") {
            delete candidats[name];

        }
        else {
            candidats[name] = val;
        }

        this.setState({ candidats: candidats });
    };

    render() {
        const { algorithme } = this.state;
        if (algorithme === "random_forest")
            params = <div>
                <Form.Group>
                    <Form.Field>
                        <Header as='h3'>Entrer Votre Nombre d'arbre : </Header>
                        <Input placeholder="Nombre d'arbre" type="number" onChange={this.onChangeNombreArbre.bind(this)} />
                    </Form.Field>
                </Form.Group>
            </div>;
        else if (algorithme === 'svm')
            params = <div>
                <Header as='h3'>Selectionner Votre Kernel:</Header>
                <Form.Group>
                    <Form.Field>
                        <Select placeholder="Kernel" options={kernel} onChange={this.onKernelChange.bind(this)} />
                    </Form.Field>
                </Form.Group>
            </div>;
        else if (algorithme === "decision_tree" || algorithme === "naive_bayes" || algorithme === "mlr")
            params = null;


        let target
        if (this.state.target === 'mentionannee')
            target = 'Mention Prévu est :'
        if (this.state.target === 'moyenneannee')
            target = 'Moyenne Prévu est :'

        return (
            <React.Fragment>
                <Segment>
                    <Form onSubmit={this.onSubmit}>
                        <Grid columns={3}>
                            <Grid.Column>
                                <Form.Field>
                                    <Header as='h3' >Sélectionner Votre Algorithme :</Header>
                                    <Form.Group>
                                        <Select placeholder="Algorithme" options={algo} onChange={this.onChangeAlgoHundler.bind(this)} />
                                    </Form.Group>
                                </Form.Field>
                            </Grid.Column>
                            <Grid.Column>
                                <Form.Field>
                                    <Header as='h3'>
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
                                    <Header as='h3' >Cible :</Header>
                                    <Segment compact>
                                        <Form.Field>
                                            <Radio toggle name={this.state.target} value={this.state.target} checked={this.state.target}
                                                label={this.state.target} onChange={this.onTargetClick} />
                                        </Form.Field>
                                    </Segment>
                                </Form.Field>
                                <Form.Field>
                                    <Button loading={this.state.loading} color='teal' type='submit'>
                                        Envoyer </Button>
                                </Form.Field>
                            </Grid.Column> : null}
                        </Grid>
                        {params}
                        {this.state.showHeader ? <Header as='h2'>
                            Saisir les information de candidat pour obtenir ça mention où ça moyenne : </Header> : null}
                        <Form.Group widths='equal'>
                            {this.featureExists('genre') ? <Form.Select title='Genre' fluid label='Genre' onChange={this.onCandidatChange} options={Genre}
                                placeholder='Genre' name="genre" value={this.state.genre} /> : null}
                            {this.featureExists('age') ? <Form.Input title='Age' fluid label='Age' onChange={this.onCandidatChange}
                                placeholder='Age' name="age" value={this.state.age} /> : null}
                            {this.featureExists('typebac') ? <Form.Select title='Type de Bac' fluid label='Type de Bac' onChange={this.onCandidatChange} options={this.formatOptions(this.state.typesbac)}
                                placeholder='Type de Bac' name="typebac" value={this.state.typebac} /> : null}
                            {this.featureExists('mentionbac') ? <Form.Select title='Mention de bac' fluid label='Mention de bac' onChange={this.onCandidatChange} options={mentionsbac}
                                placeholder='Mention de bac' name="mentionbac" value={this.state.mentionbac} /> : null}
                        </Form.Group>
                        <Form.Group widths='equal'>
                            {this.featureExists('moyformation') ? <Form.Input fluid label='Moyenne de formation' onChange={this.onCandidatChange}
                                placeholder='Mention de formation' name="moyformation" value={this.state.moyformation} /> : null}
                            {this.featureExists('excel') ? <Form.Input fluid label='Moyenne Préselection' onChange={this.onCandidatChange}
                                placeholder='Moyenne Préselection' name="excel" value={this.state.excel} /> : null}
                            {this.featureExists('concours') ? <Form.Input fluid label='Moyenne concours' onChange={this.onCandidatChange}
                                placeholder='Moyenne concours' name="concours" value={this.state.concours} /> : null}
                            {this.featureExists('dureeformation') ? <Form.Select title='Durée De Formation' fluid label='Durée De Formation' onChange={this.onCandidatChange} options={dureesformation}
                                placeholder='Durée de Bac' name="dureeformation" value={this.state.dureeformation} /> : null}
                        </Form.Group>
                        <Form.Field>
                            {this.state.showHeader ?
                                <Button loading={this.state.loading} color='teal' type='submit' onClick={this.onSubmit}>
                                    Calculer
                                </Button> : null}
                        </Form.Field>
                        {this.state.resultatShow ? <Form.Field>
                            <Header as="h2" color='blue' >
                                {target} {'"' + this.state.resultat + '"'}</Header>
                            <Header as="h2" color='blue' >
                              Précision est : {'"' + this.state.precision + '"'}</Header>
                        </Form.Field> : null}
                    </Form>
                </Segment>
            </React.Fragment>
        );
    }
}
export default MachineLearning;