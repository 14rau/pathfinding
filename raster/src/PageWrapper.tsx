import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Redirect } from "react-router";
import App from "./App";
import { ApiController } from "./lib/Api/Api";
import { inject, observer } from "mobx-react";
import { Login } from "./components/Login/Login";
import { PageStore } from "./lib/PageStore";

interface IPageWrapperProps {
    apiController?: ApiController;
    pageStore?: PageStore;
}

// contains the application router
@inject("apiController", "pageStore")
@observer
export class PageWrapper extends React.Component<IPageWrapperProps>{

    public render() {
        return <>
        <Router>
        <div>
          <Route exact path="/" component={() => {
            try {
                this.props.pageStore.checkAuthenticated();
                if(this.props.pageStore.isAuthenticated) {
                    return <Redirect to="/app"/>
                } else {
                    return <Login/>
                }
            } catch (err) {
                return <div>Could not verify login</div>
            }
        }} />

          <Route path="/app" component={() => {
            this.props.pageStore.checkAuthenticated();
              if(this.props.pageStore.isAuthenticated) {
                  return <App/>
              } else {
                  return <Redirect to="/"/>
              }
          }} />
        </div>
      </Router></>
    }
}