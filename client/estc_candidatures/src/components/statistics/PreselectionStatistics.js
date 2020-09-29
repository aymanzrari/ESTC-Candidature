import React, { Component } from 'react';
import Form from "semantic-ui-react/dist/commonjs/collections/Form";
import axios from "axios";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Radio from "semantic-ui-react/dist/commonjs/addons/Radio";
import Header from "semantic-ui-react/dist/commonjs/elements/Header";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import Filters from "./Filters";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Chart from "chart.js";
import Statistic from "semantic-ui-react/dist/commonjs/views/Statistic";
import Graph from "./Graph";
import { connect } from 'react-redux';



class PreselectionStatistics extends Component {

    constructor(props) {
        super(props);

        this.state = {
            column: 'notemodule',
            modules: [],
            target: null,
            filters: {},
            typesbac: [],
            diplomes: [],
            chart: { chart: null, number: null },
            corr: null,
            loading: false,
            elmodules: [],
            elconcours: []

        }
    }

    async componentDidMount() {
        const { data } = await axios.get('http://localhost:8000/preselect/',
            {'Authorization': `Token ${this.props.token}`}
        );


        this.setState({ modules: data.modules, elconcours: data.elconcours, elmodules: data.elmodules });


        const filterdata = await axios.get(
            'http://localhost:8000/filters/',
            { 'Authorization': `Token ${this.props.token}` }
        );

        this.setState({ typesbac: filterdata.data.typesbac, diplomes: filterdata.data.diplomes });

    }

    onTargetClick = (el, { name, value }) => {
        this.setState({ target: value });

        const filters = Object.assign({}, this.state.filters);
        if (value !== "module") {
            delete filters['codemodule'];

        }
        if (value !== "elmodule") {
            delete filters['codeelementmodule'];

        }
        this.setState({ filters: filters });
    };
    onColumnChange = (el, { name, value }) => {

        this.setState({ [name]: value });
        this.clearColumnFilter(value)
    };


    onFiltersChange = (e, el) => {
        let filters = Object.assign({}, this.state.filters);
        const val = el.value;

        if (val === "") {
            delete filters[el.name];
        }
        else
            filters[el.name] = val;

        this.setState({ filters: filters });
    };

    clearColumnFilter = (val) => {
        let filters = Object.assign({}, this.state.filters);

        if (val !== 'elconcours') {
            delete filters['libelle'];
        }

        this.setState({ filters: filters });
    };
    async onSubmit(e) {
        try {
            this.setState({ loading: true });
            const filters = Object.assign({}, this.state.filters);
            if (this.state.target === 'elmodule' || this.state.target === 'module') {
                filters['idsession'] = '=2';

            }
            const postData = {
                'column': this.state.column,
                'filters': filters,
                'target': this.state.target
            };

            const { data } = await axios.post('http://localhost:8000/preselect/', postData,
                {'Authorization': `Token ${this.props.token}`}
            );
            this.setState({ loading: false });

            const ctx = document.getElementById("chart_etudiants").getContext('2d');

            this.setState({ corr: data.corr, loading: false });
            let crt = this.state.chart;
            if (crt.chart !== null) {
                crt.chart.clear();
                crt.chart.destroy();

            }
            let options = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        ticks: { beginAtZero: true }
                    }],
                    yAxes: [{
                        ticks: { beginAtZero: true }
                    }]
                },
                legend: {
                    labels: {
                        fontSize: 0
                    }
                }
            };

            let chartData = {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            data: data.result,
                            borderColor: '#2196f3',
                            backgroundColor: '#2196f3',
                            options: options
                        }
                    ]
                }
            };

            chartData['options'] = {
                plugins: {
                    datalabels: {
                        formatter: {},
                        display: false
                    },
                },
                legend: { display: false }
            };

            const chart = new Chart(ctx, chartData);

            chart.update();
            crt.chart = chart;
            this.setState({ loading: false, chart: crt });
        }
        catch (err) {

            this.setState({ loading: false });
            alert(err);
        }


    }


    render() {

        const elconcours = this.state.elconcours.map(el => (
            {
                key: el,
                text: el,
                value: el
            }
        ));
        const elmodules = this.state.elmodules.map(el => (
            {
                key: el.codeelementmodule,
                text: el.libelleelementmodule,
                value: el.codeelementmodule
            }
        ));
        console.log(elmodules);
        const modules = this.state.modules.map(el => (
            {
                key: el.codemodule,
                text: el.libellemodule,
                value: el.codemodule
            }
        ));
        return (
            <React.Fragment>
                <Form onSubmit={this.onSubmit.bind(this)}>
                    <Grid columns={2}>
                        <Grid.Column>
                            <Header as='h4'>Selectionner</Header>
                            <Form.Field>
                                <Radio name='column' value='excel' label='Moyenne excel'
                                    onChange={this.onColumnChange.bind(this)} checked={this.state.column === 'excel'} />
                            </Form.Field>
                            <Form.Field>
                                <Radio name='column' value='concours' label='Moyenne concours'
                                    onChange={this.onColumnChange.bind(this)} checked={this.state.column === 'concours'} />
                            </Form.Field>
                            <Form.Group>
                                <Form.Field>
                                    <Radio name='column' value='elconcours' label='Moyenne élements de concours'
                                        onChange={this.onColumnChange.bind(this)} checked={this.state.column === 'elconcours'} />
                                </Form.Field>

                                <Grid style={{ display: (this.state.column === "elconcours" ? '' : 'none') }}>
                                    <Form.Field>
                                        <Form.Select
                                            name='libelle' onChange={this.onFiltersChange.bind(this)}

                                            options={elconcours}
                                            label='Elements Concours'
                                        />
                                    </Form.Field>
                                </Grid>
                            </Form.Group>
                        </Grid.Column>
                        <Grid.Column>
                            <Form.Field>
                                <Header as='h4'>Target</Header>
                                <Segment compact>

                                    <Form.Field>
                                        <Radio toggle name='target' value='moyenneannee' checked={this.state.target === 'moyenneannee'}
                                            label="Moyenne d'année" onChange={this.onTargetClick} />

                                    </Form.Field>
                                    <Form.Group>
                                        <Form.Field>
                                            <Radio toggle name='target' value='elmodule' checked={this.state.target === 'elmodule'}
                                                label="Elements de module" onChange={this.onTargetClick} />
                                        </Form.Field>
                                        <Form.Field>
                                            <Grid style={{ display: this.state.target === 'elmodule' ? '' : 'none' }}>
                                                <Form.Select
                                                    name='codeelementmodule' onChange={this.onFiltersChange.bind(this)}
                                                    options={elmodules} label='Elements module'
                                                />
                                            </Grid>
                                        </Form.Field>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Field>
                                            <Radio toggle name='target' value='module' checked={this.state.target === 'module'}
                                                label="Modules" onChange={this.onTargetClick} />
                                        </Form.Field>

                                        <Form.Field>
                                            <Grid style={{ display: this.state.target === 'module' ? '' : 'none' }}>
                                                <Form.Select
                                                    name='codemodule' onChange={this.onFiltersChange.bind(this)}
                                                    options={modules} label='Modules'
                                                />
                                            </Grid>
                                        </Form.Field>
                                    </Form.Group>
                                </Segment>
                            </Form.Field>
                            <Form.Field>
                                <Button loading={this.state.loading} color='teal' type='submit'>
                                    Envoyer
                                </Button>
                                {/*<Loader active={ this.state.loading } inline color='purple'/>*/}
                                {/*<Icon loading name='spinner' color='purple' size='big' /> */}
                            </Form.Field>
                        </Grid.Column>
                        <Grid.Column>
                            <Filters onChange={this.onFiltersChange.bind(this)}
                                typesbac={this.state.typesbac} diplomes={this.state.diplomes} />
                        </Grid.Column>

                    </Grid>
                </Form>
                <Grid style={{ display: this.state.corr ? 'flex' : 'none' }}>
                    <Grid.Row>
                        <Statistic color={(() => {
                            if (this.state.corr > 0.75) return 'green';
                            else if (this.state.corr > 0.45) return 'orange';
                            else return 'red';
                        })()}>
                            <Statistic.Value>{this.state.corr}</Statistic.Value>
                            <Statistic.Label>Coefficient de corrélation</Statistic.Label>
                        </Statistic>
                    </Grid.Row>
                    <Grid.Row>
                        <Graph chart="chart_etudiants" />
                    </Grid.Row>
                </Grid>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        token: state.token
    };
};

export default connect(mapStateToProps, null)(PreselectionStatistics);