import React, { Component } from 'react';
import {Grid, Label, Form, Button, Segment, Header, Icon, Loader, Dimmer} from "semantic-ui-react";

import Filters from "./Filters";
import axios from "axios";
import Chart from "chart.js";
import { connect } from 'react-redux';
import $ from 'jquery';
import classes from './DImmerStyle.css'

const style = {
    list_buttons: {
        width: '100%',
        height: '200px',
        overflowY: 'scroll'
    }
};
class MoyStatistics extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fields: [],
            typesbac: [],
            diplomes: [],
            modules: [],
            elconcours: [],
            elmodules: [],
            filters: {},
            labels: [],
            op: 'avg',
            loading: false

        }

    }

    async componentDidMount() {
        try {
            const filterdata = await axios.get('http://localhost:8000/filters',
                { 'Authorization': `Token ${this.props.token}` }
            );
            const { data } = await axios.get('http://localhost:8000/preselect',
                { 'Authorization': `Token ${this.props.token}` }
            );


            this.setState({
                typesbac: filterdata.data.typesbac, modules: data.modules, diplomes: filterdata.data.diplomes,
                elconcours: data.elconcours,
                elmodules: data.elmodules
            });

            this.initChart(data.annees);
            // Chart.plugins.clear();


        } catch (err) {
            alert(err);
        }

    }

    chart = null;
    randomizeColors = (n) => {
        let colors = [];

        const letters = '0123456789ABCDEF'.split('');

        for (let i = 0; i < n; i++) {
            colors[i] = '#';
            for (let j = 0; j < 6; j++) {
                colors[i] += letters[Math.floor(Math.random() * 16)];
            }
        }
        return colors;
    };
    initChart = annees => {
        const ctx = document.getElementById('chart');
        this.chart = new Chart(ctx, {
            data: {
                labels: annees,
                datasets: []
            },
            type: 'line',
            options: {
                scales: {
                    yAxes: [{

                        ticks: {
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Notes',
                            fontSize: 20
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            fontSize: 25,
                            labelString: 'Années'
                        }
                    }]
                },

                plugins: {
                    datalabels: {
                        formatter: {},
                        display: false
                    },
                }
            },

        });
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

    formatFilters(filters) {
        let flt = '';

        const keys = Object.keys(filters);

        keys.forEach((key, index) => {
            if (key === 'codemodule' || key === 'codeelementmodule' || key === 'idsemestre')
                return;

            flt += key + ': ' + filters[key];
            if (index !== keys.length - 1)
                flt += ', ';
        });


        return flt;
    }
    index = 0;

    onClick = (e, el) => {
        this.setState({loading: true});
        this.refs.filters.clearFilters();
        const field = el.field;
        const value = el.value;

        if (el.icon === 'plus') {
            const filters = Object.assign({}, this.state.filters);

            const fields = this.state.fields;

            const labels = this.state.labels;

            if (value !== undefined) {
                filters[el.name] = value;
            }

            const title = el.content + '-' + (this.state.op === 'avg' ? 'Moyenne' : 'Majorant')
                + ' ' + this.formatFilters(filters);
            const id = ++this.index;

            labels.push({ title, id });

            const postData = {
                field,
                op: this.state.op,
                filters,
            };

            const datafilters = [];
            Object.keys(filters).forEach((key, index) => {
                datafilters.push({ name: key, value: filters[key] })
            });

            fields.push({ field, filters: datafilters });

            this.setState({ filters: {}, fields, labels });

            axios.post('http://localhost:8000/notes/', postData,
                { 'Authorization': `Token ${this.props.token}`})
                .then(resp => {
                this.addLineToChart(this.chart, resp.data.result, title, this.randomizeColors(1)[0], id);
                this.setState({loading: false});
                const hash = '#downloadImage';
                $('html, body').animate({
                    scrollTop: $(hash).offset().top

                    }, 250, function(){

                    // Add hash (#) to URL when done scrolling (default click behavior)
                    window.location.hash = hash;
                });
            });
        }
    };
    addLineToChart = (chart, data, label, color, id) => {
        const datasets = chart.data.datasets;
        datasets.push({
            id: id,
            label: label,
            borderColor: color,
            fill: false,
            data: data
        });
        chart.update();
    };
    removeLineChart = (chart, id) => {
        const datasets = chart.data.datasets;
        datasets.forEach((ds, index) => {
            if (ds.id === id) {
                datasets.splice(index, 1);
            }
        });
        chart.update();
    };
    colors = this.randomizeColors(16);

    close = (e, el) => {
        const labels = this.state.labels;
        const id = el.id;
        labels.forEach((lbl, index) => {
            if (lbl.id === id)
                labels.splice(index, 1);
        });
        this.setState({ labels });
        this.removeLineChart(this.chart, id);

    };
    onOpChange = (e, { value }) => {
        this.setState({ op: value })
    };
    onDownload = (e, el) => {
        const link = document.getElementById(el.id);
        link.href = document.getElementById('chart').toDataURL('image/png');
    };
    clearFilters = () => {

    };
    render() {
        // const elconcours = this.state.elconcours.map(el => (
        //     {
        //         key: el,
        //         text: el,
        //         value: el
        //     }
        // ));
        const modules = this.state.modules.map(m => (
            <Form.Field key={m.codemodule}>
                <Button type='button' fluid basic content={m.libellemodule} onClick={this.onClick}
                    icon='plus' labelPosition='right'
                    field='module' name='codemodule' value={m.codemodule} />
            </Form.Field>

        ));
        const segmentStyle = {
            marginLeft: '8px'
        }
        const elmodules = this.state.elmodules.map(el => (
            <Form.Field key={el.codeelementmodule}>
                <Button type='button' fluid basic content={el.libelleelementmodule} field='elmodule'
                    name='codeelementmodule' value={el.codeelementmodule}
                    onClick={this.onClick}
                    icon='plus' labelPosition='right' />
            </Form.Field>

        ));

        const labels = this.state.labels.map((lbl, index) => {

            return (<Label as='a'>
                {lbl.title}
                <Icon name='delete' id={lbl.id} onClick={this.close} />
            </Label>)
        });

        return (
            <React.Fragment style={{scrollBehavior: 'smooth'}}>
                <Dimmer active={this.state.loading} className={classes.dimmerStyle}>
                    <Loader size='small'>
                        Chargement..
                    </Loader>
                </Dimmer>
                <Segment placeholder>
                    <Button as='a' color='teal' id='downloadImage' download='chart.png' href='#' onClick={this.onDownload}
                        content='Telecharger' icon='download' labelPosition='right' />
                    <canvas id='chart'>
                    </canvas>
                </Segment>
                <Grid columns={2}>
                    <Grid.Row>
                        <Form>
                            <Grid stackable>
                                <Grid.Column width={9}>
                                    <Label.Group>
                                        {labels}
                                    </Label.Group>
                                    <Form.Field>
                                        <Form.Select label='Opération:' fluid options={
                                            [
                                                { key: 1, text: 'Moyenne', value: 'avg' },
                                                { key: 2, text: 'Majorant', value: 'max' },
                                            ]} name='op' onChange={this.onOpChange} selected={'avg'} />
                                    </Form.Field>

                                    <Form.Group inline>
                                        <Form.Field>
                                            <Button
                                                type='button'
                                                basic
                                                field='moyenneannee'
                                                onClick={this.onClick}
                                                content='Année'
                                                icon='plus'
                                                labelPosition='right' />
                                        </Form.Field>
                                        <Form.Field>
                                            <Button type='button'
                                                basic
                                                field='excel'
                                                onClick={this.onClick}
                                                content='Excel'
                                                icon='plus'
                                                labelPosition='right' />
                                        </Form.Field>
                                        <Form.Field>
                                            <Button
                                                type='button'
                                                content='S5'
                                                field='moysemestre'
                                                onClick={this.onClick}
                                                name='idsemestre'
                                                value='s5'
                                                basic
                                                icon='plus'
                                                labelPosition='right' />
                                        </Form.Field>
                                        <Form.Field>
                                            <Button
                                                type='button'
                                                content='S6'
                                                field='moysemestre'
                                                onClick={this.onClick}
                                                name='idsemestre'
                                                value='s6'
                                                basic
                                                icon='plus'
                                                labelPosition='right' />
                                        </Form.Field>
                                    </Form.Group>
                                    <Form.Group>
                                        <Segment style={segmentStyle}>
                                            <Header as='h3' align='center'>Modules</Header>
                                            <div id="modules_list" style={style.list_buttons}>
                                                {modules}
                                            </div>
                                        </Segment>
                                    </Form.Group>
                                    <Form.Group>
                                        <Segment style={segmentStyle}>
                                            <Header as='h3' align='center'>Elements Module</Header>
                                            <div id="elmodules_list" style={style.list_buttons}>
                                                {elmodules}
                                            </div>
                                        </Segment>
                                    </Form.Group>
                                </Grid.Column>
                                <Grid.Column width={7}>
                                    <Header as='h3'>Filtres</Header>
                                    <Filters ref='filters' onChange={this.onFiltersChange.bind(this)}
                                        typesbac={this.state.typesbac} diplomes={this.state.diplomes} />
                                </Grid.Column>
                            </Grid>
                        </Form>
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

export default connect(mapStateToProps)(MoyStatistics);