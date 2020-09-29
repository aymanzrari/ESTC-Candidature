import React, { Component } from 'react';
import Form from "semantic-ui-react/dist/commonjs/collections/Form";
import axios from "axios";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Radio from "semantic-ui-react/dist/commonjs/addons/Radio";
import Header from "semantic-ui-react/dist/commonjs/elements/Header";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import Filters from "./Filters";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Graph from "./Graph";
import Chart from "chart.js";
import Statistic from "semantic-ui-react/dist/commonjs/views/Statistic";
import { connect } from 'react-redux';


class EtudiantStatistics extends Component {

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
            loading: false

        }
    }

    async componentDidMount() {
        const data = await axios.get('http://localhost:8000/modules',
            { 'Authorization': `Token ${this.props.token}` }
        );

        this.setState({ modules: data.data.modules });

        const filterdata = await axios.get('http://localhost:8000/filters',
             { 'Authorization': `Token ${this.props.token}` });

        this.setState({ typesbac: filterdata.data.typesbac, diplomes: filterdata.data.diplomes });
    }


    onTargetClick = (el, { name, value }) => {
        this.setState({ target: value });
        if (value !== 'moyennesemestre') {
            const filters = Object.assign({}, this.state.filters);
            delete filters['idsession'];
            delete filters['idsemestre'];
            this.setState({ filters: filters });
        }
        else {
            const filters = Object.assign({}, this.state.filters);
            filters['idsession'] = filters.module_session;
            this.setState({ filters: filters });
        }


    };
    onChange = (el, { name, value }) => {

        this.setState({ [name]: value })
    };

    onFiltersChange = (e, el) => {

        let filters = Object.assign({}, this.state.filters);
        const val = el.value;

        if (val === "") {
            delete filters[el.name];
        }
        else
            filters[el.name] = val;

        if (el.name === 'module_session' && this.state.target === 'moyennesemestre') {
            filters['idsession'] = val;
        }

        this.setState({ filters: filters });


    };

    async onSubmit(e) {

        const postData = { column: this.state.column, target: this.state.target, filters: this.state.filters };
        this.setState({ loading: true });
        try {
            const { data } = await axios.post('http://localhost:8000/modules/',postData,
                { 'Authorization': `Token ${this.props.token}` });

            const ctx = document.getElementById("chart_etudiants").getContext('2d');

            this.setState({ corr: data.corr, loading: false });
            let crt = this.state.chart;
            if (crt.chart !== null) {
                crt.chart.clear();
                crt.chart.destroy();

            }
            var options = {
                responsive: true, // Instruct chart js to respond nicely.
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
                            data: data.notes,
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
            console.log(chart.options);
            chart.update();
            crt.chart = chart;
            this.setState({ loading: false, chart: crt });
        }
        catch (err) {
            alert(err);
            this.setState({ loading: false });
        }

    };

    sessionModuleOptions = [
        { key: 1, text: "Session normale", value: '=1' }, { key: 2, text: "Aprés rattrapage", value: '=2' },
        { key: 3, text: "Redouble normale", value: '=3' },
        { key: 4, text: "Redouble apres rattrapage", value: '=4' }
    ];


    render() {

        const modules = this.state.modules.map(module => (
            {
                key: module.codemodule,
                text: module.libellemodule,
                value: module.codemodule
            }
        ));

        return (
            <React.Fragment>
                <Form method='GET' onSubmit={this.onSubmit.bind(this)}>
                    <Grid columns={2}>
                        <Grid.Column>
                            <Form.Field>
                                <Form.Select
                                    onChange={this.onFiltersChange.bind(this)}
                                    options={modules}
                                    label='Modules'
                                    name='codemodule'
                                />
                            </Form.Field>
                            <Form.Group widths={2}>
                                <Form.Select label='Session de Module' placeholder='Session de module' name='module_session'
                                    onChange={this.onFiltersChange.bind(this)} options={this.sessionModuleOptions} />

                            </Form.Group>
                            <Form.Field>
                                <Header as='h4'>Target</Header>
                                <Segment compact>
                                    <Form.Group inline>
                                        <Form.Field>
                                            <Radio toggle name='target' value='moyennesemestre' checked={this.state.target === 'moyennesemestre'}
                                                label="Moyenne de semestre" onChange={this.onTargetClick} />
                                        </Form.Field>

                                        <Segment style={{ display: this.state.target === 'moyennesemestre' ? 'flex' : 'none' }}>

                                            <Form.Field>
                                                <Radio
                                                    name='idsemestre' value='s5' label='S5'
                                                    onChange={this.onFiltersChange.bind(this)}
                                                    checked={this.state.filters.idsemestre === 's5'}
                                                />

                                                <Radio
                                                    name='idsemestre' value='s6' label='S6'
                                                    onChange={this.onFiltersChange.bind(this)}
                                                    checked={this.state.filters.idsemestre === 's6'}
                                                />
                                            </Form.Field>

                                        </Segment>

                                    </Form.Group>
                                    <Form.Field>
                                        <Radio toggle name='target' value='moyenneannee' checked={this.state.target === 'moyenneannee'}
                                            label="Moyenne d'année" onChange={this.onTargetClick} />
                                    </Form.Field>
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

export default connect(mapStateToProps)(EtudiantStatistics);