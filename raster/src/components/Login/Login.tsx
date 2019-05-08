import * as React from "react";
import logo from "./logo.png";
import { ControlGroup, InputGroup, Button, Icon } from "@blueprintjs/core";
import { observer, inject } from "mobx-react";
import { observable } from "mobx";
import { ApiController } from "../../lib/Api/Api";
import { PageStore } from "../../lib/PageStore";
import { Redirect } from "react-router";

interface ILoginProps {
    apiController?: ApiController;
    pageStore?: PageStore;
}

@inject("apiController", "pageStore")
@observer
export class Login extends React.Component<ILoginProps>{
    @observable private user = "";
    @observable private pass = "";
    @observable private error = "";
    @observable private loading = false;

    public async componentDidMount() {
        try {
            await this.props.pageStore.checkAuthenticated();
        } catch (err) {
            alert("Could not verify login token")
        }
        if(this.props.pageStore.isAuthenticated) {
            this.forceUpdate();
        }
    }

    public render() {
        return <div style={{width: "400px", height: "200px", margin: "auto", padding: "20px", background: "steelblue",}}>
            <img src={logo}/>
            <ControlGroup fill={true} vertical={false}>
                <InputGroup value={this.user} onChange={e => this.user = e.target.value}/>
                <div style={{border: "1px solid #ddd"}}><Icon icon="user" intent="success" iconSize={24}/></div>
            </ControlGroup>
            <ControlGroup fill={true} vertical={false}>
                <InputGroup type="password" value={this.pass} onChange={e => this.pass = e.target.value}/>
                <div style={{border: "1px solid #ddd"}}><Icon icon="key" intent="success" iconSize={24}/></div>
            </ControlGroup>
            <Button loading={this.loading} onClick={async () => {
                this.loading = true;
                try {
                    let { user, pass } = this;
                    let response = await this.props.apiController.post("pathfinding/login/", { user, pass });
                    if(response.session) {
                        this.props.pageStore.token = response.session;
                        await this.props.pageStore.checkAuthenticated();
                        window.localStorage.setItem("token", response.session);
                        this.props.pageStore.isAuthenticated = true;
                    } else {
                        this.error = "Login was invalid"
                    }
                } catch (err) {
                    this.error = "Login failed. Loginserver was not reached!";
                    // just login when there is no server, lul :x #debugging
                    this.props.pageStore.isAuthenticated = true;
                } finally {
                    this.loading = false;
                }
            }} text="login"/>
            {this.props.pageStore.isAuthenticated && <Redirect to="/app"/>}
            {this.error}
        </div>
    }
}