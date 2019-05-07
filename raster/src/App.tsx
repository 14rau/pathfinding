import React, { Component } from "react";
import { observer, inject } from "mobx-react"
import './App.css';
import { Editor } from "./components/Editor/Editor";
import { Tabs, Tab, Button, RadioGroup, Radio, ControlGroup, InputGroup } from "@blueprintjs/core";
import { WebGL } from "./lib/WebGL";
import { PageStore } from "./lib/PageStore";
import { ApiController } from "./lib/Api/Api";
import { observable, toJS } from "mobx";
import { Loading } from "./components/Loading/Loading";
import autobind from "autobind-decorator";

interface IAppProps {
  pageStore?: PageStore;
  apiController?: ApiController;
}



@inject("pageStore")
@observer
class App extends Component<IAppProps> {
  @observable private showSettings = false;
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

    return <>
        {!this.showSettings ? <div style={{position: "absolute", right: 1}}><Button icon="cog" onClick={() => this.showSettings = !this.showSettings}/></div> : <div style={{
          position: "absolute",
          width: "300px",
          height: "500px",
          right: 1,
          background: "steelblue",
          border: "1px solid #ddd",
          overflow: "auto"
      }}>
          <Button icon="cog" onClick={() => this.showSettings = !this.showSettings}/>
          <Button icon="log-out" intent="danger" onClick={async () => {
            window.localStorage.setItem("token", "");
            await this.props.apiController.post("pathfinding/logout/", { session: this.props.pageStore.token })
            window.location.assign("/");
          }}/>
          <div style={{padding: "5px"}}>
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
              <Radio label="IDGAF" value={5} />
              <Radio label="Placeholder" value={6} />
            </RadioGroup>
            <Editor map/>
            <ControlGroup fill={true} vertical={false}>
              <InputGroup value={this.props.pageStore.mapName} onChange={e => this.props.pageStore.mapName = e.target.value}/>
              <Button text="Upload" onClick={this.props.pageStore.uploadMap}/>
            </ControlGroup>
          </div>
      </div>}
    {this.loading && <Loading/>}
    <Tabs vertical id="TabsExample" selectedTabId={this.props.pageStore.currentView} onChange={this.props.pageStore.setView}>
      <Tab id="ng" title="Editor" panel={<Editor />} />
      <Tab id="mb" title="View" panel={<WebGL />} />
      <Button text="Calculate Path" onClick={this.sendData}/>
    </Tabs>
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
      let request = await this.props.apiController.post("pathfinding", {
          map: toJS(this.props.pageStore.mapData),
          algorithm: toJS(this.props.pageStore.algorithm),
          settings: [ 0, 1, 3, 4 ]
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
