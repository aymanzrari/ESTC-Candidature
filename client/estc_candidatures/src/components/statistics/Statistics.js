import React, { Component } from 'react';
import Candidats from "./Candidats";

import { Grid } from "semantic-ui-react";
import Radium from 'radium';
import EtudiantStatistics from "./EtudiantStatistics";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import PreselectionStatistics from "./PreselectionStatistics";
import MoyStatistics from "./MoyStatistics";
import Rapport from './Rapport';
import classes from '../layout/NavBar.module.css';


class Statistics extends Component {
    constructor(props) {
        super(props);
        this.state = {

            activeItem: 'Candidats',
            show: false,
        }
    };
    handleItemClick = (e, { name }) => {
        this.setState({ activeItem: name });
    };

    render() {
        // const updatedClasses = [classes.FontSize, classes.Active]
        const { activeItem } = this.state;
        let categoryStatistics;

        if (activeItem === 'Candidats')
            categoryStatistics = <Candidats />;
        else if (activeItem === 'Préselection')
            categoryStatistics = <PreselectionStatistics />;
        else if (activeItem === 'Aprés Selection')
            categoryStatistics = <EtudiantStatistics />;
        else if (activeItem === 'Notes')
            categoryStatistics = <MoyStatistics />;
        else if (activeItem === 'Rapport')
            categoryStatistics = <Rapport />;

        return (
            <React.Fragment>
                <Grid stackable stretched style={{minHeight: '100vh'}}>
                    <Grid.Column width={3} >
                        <Menu vertical compact className={classes.navbar}>
                            <Menu.Item>
                                <Menu.Header>
                                    Statistiques
                                </Menu.Header>
                                <Menu.Item
                                    name='Candidats'
                                    active={activeItem === 'Candidats'}
                                    onClick={this.handleItemClick} />


                                <Menu.Item
                                    active={activeItem === 'Notes'}
                                    name='Notes'
                                    onClick={this.handleItemClick}
                                />
                                <Menu.Item
                                    active={activeItem === 'Rapport'}
                                    name='Rapport'
                                    onClick={this.handleItemClick}
                                />
                            </Menu.Item>
                            <Menu.Item>
                                <Menu.Header>
                                    Corrélations
                                </Menu.Header>
                                <Menu.Item
                                    name='Préselection'
                                    active={activeItem === 'Préselection'}
                                    onClick={this.handleItemClick} />
                                    <Menu.Item
                                    active={activeItem === 'Aprés Selection'}
                                    name='Aprés Selection'
                                    onClick={this.handleItemClick}/>
                            </Menu.Item>

                        </Menu>
                    </Grid.Column>

                    <Grid.Column width={13} >
                        {categoryStatistics}
                    </Grid.Column>
                </Grid>
            </React.Fragment >


        );
    }
}
export default Radium(Statistics);