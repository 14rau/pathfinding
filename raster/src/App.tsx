import React, { Component } from "react";
import { observer, inject } from "mobx-react"
import './App.css';
import { Editor } from "./components/Editor/Editor";
import { Tabs, Tab, Button } from "@blueprintjs/core";
import { WebGL } from "./lib/WebGL";
import { PageStore } from "./lib/PageStore";
import { ApiController } from "./lib/Api/Api";
import { observable } from "mobx";
import { Loading } from "./components/Loading/Loading";
import autobind from "autobind-decorator";

interface IAppProps {
  pageStore?: PageStore;
}



@inject("pageStore")
@observer
class App extends Component<IAppProps> {

  private apiController = new ApiController("8080", "localhost", "http");
  @observable private loading = false;

  public render() {

    return <>
    {this.loading && <Loading/>}
    <Tabs vertical id="TabsExample" selectedTabId={this.props.pageStore.currentView} onChange={this.props.pageStore.setView}>
      <Tab id="ng" title="Editor" panel={<Editor />} />
      <Tab id="mb" title="3d - View" panel={<WebGL />} />
    </Tabs>
    <Button text="Send Requests" onClick={this.sendData}/>
    </>
  }

  @autobind
  private async sendData() {
    this.loading = true;
    try {
      let request = await this.apiController.post("pathfinding/", this.props.pageStore.mapData);
      this.props.pageStore.movement = request.data;
    } catch (err) {
      alert("Sorry, an error occured");
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}

export default App;
