import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import 'chart.js';
import Statistics from "./components/statistics/Statistics";


import Login from './views/Login/Login';
import Logout from './views/Login/Logout/Logout';
import { connect } from 'react-redux';
import * as actions from './store/actions/index'
import MachineLearning from './components/machine_learning/MachineLearning'
import NavBar from "./components/layout/NavBar";


class App extends Component {
  componentDidMount() {
    this.props.onTry();
  }
  render() {

    let routes = (
      <Switch>
        <Route path="/" exact component={Login} />
      </Switch>
    );
    if (this.props.auth) {
      routes = (
        <Switch>
          <Route path="/logout" component={Logout} />
          <Route path="/statistics" component={Statistics} />
          <Route path="/predict" component={MachineLearning} />
          <Redirect to="/statistics" />
        </Switch>
      );
    }
    else {
        routes = (
            <Switch>
                <Route path='/' component={Login}/>
            </Switch>
        )
    }
    return (
      <div className="App">
        <NavBar />
        {routes}
      </div>

    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.token !== null
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onTry: () => dispatch(actions.authCheckState())
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(App);