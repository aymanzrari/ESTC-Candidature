import React, { Component } from "react";
import {Link} from 'react-router-dom';
import {Icon, Menu} from "semantic-ui-react";
import classes from './NavBar.module.css';
import {connect} from "react-redux";

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: 'Statistics'
    }
  }

  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name });
  };
  render() {
    const { activeItem } = this.state;

    return (
      <>
          <Menu size='small' icon='labeled' className={classes.navbar} color='teal'>
            <Menu.Item as={Link} to='/statistcs'  name='Statistics' active={activeItem === 'Statistics'}
                       onClick={this.handleItemClick}>
              <Icon name='chart line'/>
              Statistiques
            </Menu.Item>
            <Menu.Item as={Link} to='/predict'
              name='Prédiction' color='teal'
              active={activeItem === 'Prédiction'}
              onClick={this.handleItemClick} >
              <Icon name='student' />
              Prédiction
            </Menu.Item>
            <Menu.Menu position='right'>
              <Menu.Item as={Link} to={this.props.token === null? "/" : "/logout"} color='teal'
                         name={this.props.token === null? "Authentification" : "Déconnecter"}
                         onClick={this.handleItemClick} >
                  <Icon name='log out' />
                  {this.props.token === null? "S'authentifier" : "Déconnexion"}
              </Menu.Item>
            </Menu.Menu>
          </Menu>
      </>
    );
  }
}
const mapStateToProps = state => {
    return {
        token: state.token
    };
};


export default connect(mapStateToProps)(NavBar);
