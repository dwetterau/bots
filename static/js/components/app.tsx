import jQuery = require("jquery");
import * as React from "react";
import {Route} from "react-router";
import {BrowserRouter} from "react-router-dom";

import {GameCanvas} from "./game_canvas"

export interface AppProps {
    message: string
}

export interface AppState {}

export class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
    }

    render() {
        let getMergedView = () => {
            return <div>
                {this.props.message}
                <GameCanvas />
            </div>
        };

        return <div>
            <BrowserRouter>
                <div>
                    <Route path="/" component={getMergedView} />
                </div>
            </BrowserRouter>
        </div>
    }
}
