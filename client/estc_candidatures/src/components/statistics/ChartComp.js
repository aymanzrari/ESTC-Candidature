import React, {Component} from 'react';
import Chart from "chart.js";
import ReactDOM from "react-dom";
import 'chartjs-plugin-datalabels';


class ChartComp extends Component {
    state = {
        chart: null
    };
    randomizeColors = (n) =>{
        let colors = [];
        const letters = '0123456789ABCDEF'.split('');
        for(let i = 0; i< n; i++) {
            colors[i] = '#';
            for (let j = 0; j < 6; j++ ) {
                colors[i] += letters[Math.floor(Math.random() * 16)];
            }
        }
        return colors;
    };
    getChart() {
        const canvas = ReactDOM.findDOMNode(this.refs.chartCanvas);
        const ctx = canvas.getContext('2d');

        const kind = this.props.kind;

        const data = this.props.data.data;
        const labels = this.props.data.labels;

        let total = 0;

        data.forEach(el => total += parseFloat(el));

        if(kind === 'pie') {
            this.preparePieData(data, labels, total);
            console.log(data);
        }

        const color  = kind === 'pie' ? '#fff' : 'black';

        const chartData = {
        type: this.props.kind,
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: (this.props.randomize ? this.randomizeColors(this.props.data.data.length):
                        ['#f1c40f', '#16a085', '#e74c3c', '#2ecc71', '#9980FA', '#D980FA', '#833471', '#ED4C67']),
        datalabels: {
        color,
        font: {
          size: 15,
          weight: 800
        },
        formatter: function(value, context) {
            //
            // return context.chart.data.labels[context.dataIndex] + "\n"
                    return (kind === 'pie' ? Math.round((value / total)*100) + '%' : value);

        },
        align:  kind ==='pie'? 'start' : 'end',
        anchor: kind ==='pie'? 'center' : 'end',
        offset: 0
      },
            }]
        },

    };
        Chart.defaults.global.defaultFontSize = 16;

        chartData['options'] = {
            plugins: {
                datalabels: {
                color: "#cc55aa",
                font: {
                    family: 'Lato',
                  size: 8
                },
                formatter: function(value) {
                    return "$"+value;
                }
              }
            },

            legend: {display: this.props.legend}
        };
        // const end = this.props.end;
        // if(end ){
        //     chartData.options.scales.yAxes[0].ticks.max = (data => Math.max(...data)) + 3;
        // }

        const chart = new Chart(ctx, chartData);

        chart.update();

        return chart;
    }
    downloadChart = (e, el) => {
        const link = document.getElementById(el.id);

        const canvas = ReactDOM.findDOMNode(this.refs.chartCanvas);
        link.href = canvas.toDataURL('image/png');
    };
    componentDidMount() {
        const chart = this.getChart();

        this.setState({chart})
    }

    preparePieData (data, labels, total) {
        data.forEach(function(value, index) {
            const v = Math.round((value / total) * 100);
            if(v === 0){
                data.splice(index, 1);
                labels.splice(index, 1);
            }
        });
    }
    updateChart = () => {

        let chart = this.state.chart;
        chart.clear();
        chart.destroy();

        chart = this.getChart();

        this.setState({chart});
    };

    render() {

        return (
            <>
                <canvas ref='chartCanvas'></canvas>
            </>
        );
    };
}

export default ChartComp;