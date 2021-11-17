import React, { useState, createRef } from 'react';
import { Container, Dimmer, Loader, Grid, Sticky, Message } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import { SubstrateContextProvider, useSubstrate } from './substrate-lib';
import { DeveloperConsole } from './substrate-lib/components';

import AccountSelector from './units/AccountSelector';
import Balances from './units/Balances';
import BlockNumber from './units/BlockNumber';
import Events from './units/Events';
import Interactor from './units/Interactor';
import Metadata from './units/Metadata';
import NodeInfo from './units/NodeInfo';
import TemplateModule from './TemplateModule';
import Transfer from './units/Transfer';
import Upgrade from './units/Upgrade';

import { BrowserRouter as Router,Route} from 'react-router-dom'
import Home from "./pages/home/Home";
import Lin from "./pages/home/Lin";
import NodeHome from "./pages/node/NodeHome";

class App extends React.Component {
    render() {
        return (
            <Router>
                <Route exact path="/" component={Home} />
                <Route path="/lin" component={Lin} />
                {/*<Route path="/node" component={NodeHome} />*/}
            </Router>
        )
    }
}

export default App;
