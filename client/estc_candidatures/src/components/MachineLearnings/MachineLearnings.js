import React, { Component } from 'react';
import { Grid, Segment } from "semantic-ui-react";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import MachineLearning from './MachineLearning/MachineLearning';
import classes from './MachineLearnings.module.css';

import NavBar from "../layout/NavBar"

class MachineLearnings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeItem: 'Machine Learning'
        }
    }
    handleItemClick = (e, { name }) => {
        this.setState({ activeItem: name });
    };

    render() {
        const { activeItem } = this.state;
        const updatedClasses = [classes.FontSize, classes.Active]
        let categoryStatistics;

        var styles = {
            backgroundColor: '#FFF',
            minHeight: '100%',
            minWidth: '100%',
            marginTop: '-1rem',
        };

        if (activeItem === 'Machine Learning')
            categoryStatistics = <MachineLearning />;
        return (
            <React.Fragment>
                <NavBar />
                <Grid style={{
                    marginTop: 0,
                    backgroundColor: '#FFF'
                }}>
                    <Grid.Column width={3} style={{
                        minHeight: '100vh'
                    }}>
                        <Menu vertical compact style={styles}>
                            <Menu.Item
                                name='Machine Learning'
                                className={activeItem === 'Machine Learning' ? updatedClasses : updatedClasses[0]}
                                onClick={this.handleItemClick} />
                        </Menu>
                    </Grid.Column>
                    <Grid.Column width={13} style={{
                        backgroundColor: '#FFF'
                    }}>
                        {categoryStatistics}
                    </Grid.Column>
                </Grid >
            </React.Fragment >
        );
    }
}
export default MachineLearnings;