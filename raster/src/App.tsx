import React, { Component } from "react";
import { observer, inject } from "mobx-react"
import './App.css';
import { Editor } from "./components/Editor/Editor";
import { Tabs, Tab, Button, RadioGroup, Radio } from "@blueprintjs/core";
import { WebGL } from "./lib/WebGL";
import { PageStore } from "./lib/PageStore";
import { ApiController } from "./lib/Api/Api";
import { observable, toJS } from "mobx";
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
    <RadioGroup
      label="Algorithm"
      onChange={e => this.props.pageStore.algorithm = parseInt((e.target as any).value)}
      selectedValue={this.props.pageStore.algorithm}
    >
      <Radio label="Random" value={0} />
      <Radio label="A*" value={1} />
      <Radio label="Djakstra" value={2} />
      <Radio label="Genetic - Feed-forward Network" value={3} />
      <Radio label="Selfmade" value={4} />
    </RadioGroup>
    <Button text="Send Requests" onClick={this.sendData}/>
    </>
  }

  /*{
  "map":[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1],[1,0,0,3,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,1],[1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],[1,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,0,1,0,1,0,0,1,0,0,1,0,0,0,0,0,0,1],[1,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,0,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
  "algorithm": 0,
  "settings": {
    "none": 0,
    "wall": 1,
    "start": 2,
    "goal": 4
  }
}

  */

  @autobind
  private async sendData() {
    this.loading = true;
    try {
      let request = await this.apiController.post("pathfinding", {data: 
        {
          map: toJS(this.props.pageStore.mapData),
          algorithm: toJS(this.props.pageStore.algorithm),
          settings: [ 0, 1, 2, 4 ]
        }
      });
      this.props.pageStore.setMovement(request.data);
      // this.props.pageStore.setMovement(["up", "up"]);
    } catch (err) {
      alert("Sorry, an error occured");
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}

export default App;
