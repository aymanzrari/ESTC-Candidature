import React, { Component } from 'react';
import { Form } from "semantic-ui-react";

const initialState = {
    anneecandidature: '',
    age: '',
    residence: '',
    mentionbac: '',
    typebac: '',
    diplome: '',
    dureeformation: '',
    genre: '',
};

class Filters extends Component {

    constructor(props) {
        super(props);
        this.state = initialState;
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


    dureesformation = [
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

    mentionsbac = [
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

    handleChange = (e, el) => {
        this.props.onChange(e, el);
        this.setState({ [el.name]: el.value });
    };

    clearFilters = () => {
        this.setState(initialState);
    };

    render() {
        return (
            <>
                <Form.Group widths={2}>
                    <Form.Input label='Année candidature' onChange={this.handleChange}
                        placeholder='Année candidature' name="anneecandidature" value={this.state.anneecandidature} />
                    <Form.Input label='Age' placeholder='Age' name='age' onChange={this.handleChange}
                        value={this.state.age} />
                </Form.Group>
                <Form.Group widths={2}>

                    <Form.Input label='Ville de Residence' name='residence' placeholder='Ville' onChange={this.handleChange}
                        value={this.state.residence} />
                    <Form.Select label='Genre' name='genre' onChange={this.handleChange}
                                 options={[{key: 0, text:"Tous", value:""},
                                     {key: 1, text:'Homme', value:'Homme'}, {key: 2, text: 'Femme', value:'Femme'}]}
                        value={this.state.genre} />
                </Form.Group>

                <Form.Group widths={2}>
                    <Form.Select label='Mention de BAC' placeholder='Mention de BAC' name='mentionbac'
                        options={this.mentionsbac} onChange={this.handleChange} value={this.state.mentionbac} />
                    <Form.Select label='Type de BAC' placeholder='Type de BAC' name="typebac" onChange={this.handleChange}
                        options={this.formatOptions(this.props.typesbac)} value={this.state.typebac} />
                </Form.Group>
                <Form.Group widths={2}>
                    <Form.Select label='Diplôme Superieur' placeholder='Diplôme Superieur' name='diplome'
                        options={this.formatOptions(this.props.diplomes)} onChange={this.handleChange}
                        value={this.state.diplome} />
                    <Form.Select label='Durée de formation' placeholder='Durée de formation'
                        name="dureeformation" options={this.dureesformation} onChange={this.handleChange}
                        value={this.state.dureeformation} />
                </Form.Group>
            </>
        );
    }
}

export default Filters;