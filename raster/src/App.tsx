import React, { Component } from "react";
import { observer, inject } from "mobx-react"
import './App.css';
import { Editor } from "./components/Editor/Editor";
import { Tabs, Tab } from "@blueprintjs/core";
import { WebGL } from "./lib/WebGL";
import { PageStore } from "./lib/PageStore";

interface IAppProps {
  pageStore?: PageStore;
}


@inject("pageStore")
@observer
class App extends Component<IAppProps> {
  public render() {
    return <Tabs vertical id="TabsExample" selectedTabId={this.props.pageStore.currentView} renderActiveTabPanelOnly onChange={this.props.pageStore.setView}>
      <Tab id="ng" title="Editor" panel={<Editor />} />
      <Tab id="mb" title="3d - View" panel={<WebGL data={this.props.pageStore.mapData} path={this.props.pageStore.movement}/>} />
    </Tabs>
  }
}

export default App;
