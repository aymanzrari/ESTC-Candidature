import React, { Component } from 'react';
import { Button, Form, Grid, Header, Modal, Table } from "semantic-ui-react";
import { connect } from 'react-redux';
import axios from 'axios';
import RapportResult from "./RapportResult";
import ReactToPrint from 'react-to-print';

const anneeOptions = [
    {
        key: 0,
        text: "Tous",
        value: '',
    },
    {
        key: 1,
        text: "2014/2015",
        value: '=2015'
    },
    {
        key: 2,
        text: "2015/2016",
        value: '=2016'
    },
    {
        key: 3,
        text: "2016/2017",
        value: '=2017'
    },
    {
        key: 4,
        text: "2017/2018",
        value: '=2018'
    }
];
const dureesformation = [
    {
        key: 0,
        text: "Tous",
        value: '',
    },
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
const mentionsbac = [
    {
        key: 0,
        text: "Tous",
        value: '',
    },
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


class Rapport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fields: [],
            filters: [],
            diplomes: [],
            typesbac: [],
            modules: [],
            reportResult: {},
            open: false,
            loading: false,
            listDescription: [],
            preinscSelected: false,
            selectSelected: false,
        }
    }
    async componentDidMount() {

        const filterdata =
            await axios.get('http://localhost:8000/filters/',{ 'Authorization': `Token ${this.props.token}`});
        this.setState({ typesbac: filterdata.data.typesbac, diplomes: filterdata.data.diplomes,
                    modules: filterdata.data.modules});
    }

    formatOptions = (values) => {
        let opts = values.map(value => (

            {
                key: value,
                value: value,
                text: value
            }
        ));
        opts.splice(0, 0, {
            key: 0,
            text: "Tous",
            value: '',
        });
        return opts;
    };
    handleChange = (e, el) => {
        const fields = this.state.fields;
        let preinscSelected = false;
        let selectSelected = false;

        for (let i = 0; i < fields.length; i++) {
            if (fields[i].indexOf('sel') > -1) {
                if (!selectSelected)
                    selectSelected = true;
            }
            else if (!preinscSelected)
                preinscSelected = true;

        }

        if (!el.checked)
            fields.splice(fields.indexOf(el.value), 1);
        else
            fields.push(el.value);

        this.setState({ fields, selectSelected, preinscSelected });

    };

    onFiltersChange = (e, el) => {
        const filters = Object.assign({}, this.state.filters);
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
            delete filters[name];

        }
        else {
            filters[name] = val;
            listDescription.push({ key: filterText, value: val })
        }

        this.setState({ filters: filters, listDescription: listDescription });
    };
    moduleChange = (e, el) => {
        this.setState({ 'rptmodules': el.value })
    };

    onSubmit = (e, el) => {
        const fields = this.state.fields;
        const filters = this.state.filters;
        this.setState({ loading: true });

        axios({
            method: 'post',
            url: 'http://localhost:8000/rapport/',
            data: {
                'fields': fields, 'filters': filters,
                'modules': this.state.rptmodules
            },
            headers: { 'Authorization': `Token ${this.props.token}` }
        }).then(resp => {
            this.setState({ reportResult: resp.data.result, open: true, loading: false })
            console.log(resp.data);

        }).catch(err => {
            console.log("Error!! " + err);
            this.setState({ loading: false });
        });
    };
    close = () => {
        this.setState({ open: false });
    };

    print = () => {

    };

    render() {

        return (
            <div style={{ padding: '10px' }} >
                <Grid>
                    <Grid.Row>
                        <Form onSubmit={this.onSubmit}>
                            <Grid stackable>
                                <Grid.Row>
                                    <Grid.Column width={6}>
                                        <Header as='h2' className='teal'>Filtres</Header>
                                        <Form.Group widths={2}>
                                            <Form.Select title='Année' fluid label='Année candidature' onChange={this.onFiltersChange} options={anneeOptions}
                                                placeholder='Tous' name="anneecandidature" value={this.state.anneecandidature} />
                                            <Form.Input title='Age' label='Age' placeholder='Age' name='age' onChange={this.onFiltersChange}
                                                value={this.state.age} />
                                        </Form.Group>
                                        <Form.Group widths={2}>

                                            <Form.Input title='Ville de résidence' label='Ville de Residence' name='residence' placeholder='Ville' onChange={this.onFiltersChange}
                                                value={this.state.residence} />
                                            <Form.Select title='Genre' label='Genre' name='genre' placeholder='Genre' onChange={this.onFiltersChange}
                                                value={this.state.genre} options={[{ key: 0, text: 'Tous', value: '' },
                                                { key: 1, text: 'Homme', value: 'Homme' },
                                                { key: 2, text: 'Femme', value: 'Femme' }]} />
                                        </Form.Group>
                                        <Form.Group widths={2}>
                                            <Form.Select title='Mention de BAC' label='Mention de BAC' placeholder='Mention de BAC' name='mentionbac'
                                                options={mentionsbac} onChange={this.onFiltersChange} value={this.state.mentionbac} />
                                            <Form.Select title='Type de BAC' label='Type de BAC' placeholder='Type de BAC' name="typebac" onChange={this.onFiltersChange}
                                                options={this.formatOptions(this.state.typesbac)} value={this.state.typebac} />

                                        </Form.Group>
                                        <Form.Group widths={2}>

                                            <Form.Select title='Diplôme Superieur' label='Diplôme Superieur' placeholder='Tous' name='diplome'
                                                options={this.formatOptions(this.state.diplomes)} onChange={this.onFiltersChange}
                                                value={this.state.diplome} />


                                            <Form.Select title='Diplôme Superieur' label='Durée de formation' placeholder='Tous'
                                                name="dureeformation" options={dureesformation} onChange={this.onFiltersChange}
                                                value={this.state.dureeformation} />
                                        </Form.Group>
                                    </Grid.Column>
                                    <Grid.Column width={8}>
                                        <Grid.Row>
                                            <Table basic='very' celled collapsing>
                                                <Table.Body>
                                                    <Table.Row>
                                                        <Table.Cell>
                                                            <Header as='h4'>Préinscrits</Header>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Form.Checkbox label='Moyenne de formation' name='fields' value='moyformation'
                                                                onChange={this.handleChange} />
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Form.Checkbox label='Moyenne Excel' name='fields' value='excel'
                                                                onChange={this.handleChange} />
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Form.Checkbox label='Mentions de BAC' name='fields' value='mentionbac'
                                                                onChange={this.handleChange} />
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Form.Checkbox label='Types de BAC' name='fields' value='typebac'
                                                                onChange={this.handleChange} />
                                                        </Table.Cell>
                                                    </Table.Row>
                                                    <Table.Row>
                                                        <Table.Cell>
                                                            <Header as='h4'>Séléctionnés</Header>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Form.Checkbox label='Moyenne de formation' name='fields' value='selmoyformation'
                                                                onChange={this.handleChange} />
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Form.Checkbox label='Moyenne Excel' name='fields' value='selexcel'
                                                                onChange={this.handleChange} />
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Form.Checkbox label='Mentions de BAC' name='fields' value='selmentionbac'
                                                                onChange={this.handleChange} />
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Form.Checkbox label='Types de BAC' name='fields' value='seltypebac'
                                                                onChange={this.handleChange} />
                                                        </Table.Cell>
                                                    </Table.Row>
                                                    <Table.Row>
                                                        <Table.Cell>
                                                            <Header as='h4'>Autres</Header>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Form.Checkbox label='Diplomes' name='fields' value='seldiplome'
                                                                onChange={this.handleChange} />
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Form.Checkbox label='Mention Année GLAASRI' name='fields' value='selmentiongl'
                                                                onChange={this.handleChange} />
                                                        </Table.Cell>
                                                    </Table.Row>
                                                </Table.Body>
                                            </Table>
                                        </Grid.Row>
                                        <Grid.Row>
                                            <Grid.Column>
                                                <Form.Field>
                                                    <Button type="submit" primary loading={this.state.loading}>Envoyer</Button>
                                                </Form.Field>
                                            </Grid.Column>
                                        </Grid.Row>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Form>
                    </Grid.Row>

                </Grid>
                <Modal dimmer='blurring' size='fullscreen' open={this.state.open} onClose={this.close}>
                    <Modal.Header>Rapport</Modal.Header>
                    <Modal.Content >
                        <Modal.Description>
                            <RapportResult ref='rpt' reportResult={this.state.reportResult} listDescription={this.state.listDescription}
                                preinscrit={this.state.preinscSelected} selectionne={this.state.selectSelected} />
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='black' onClick={this.close}>
                            Fermer
                    </Button>

                        <ReactToPrint
                            trigger={() =>
                                <Button primary icon='print' onClick={this.print}>
                                    Sauvegarder
                                </Button>
                            }
                            content={() => this.refs.rpt}
                        />
                    </Modal.Actions>
                </Modal>


            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        token: state.token
    };
};

export default connect(mapStateToProps)(Rapport);
