import * as React from "react";

export class GameCanvas extends React.Component<{}, {}> {
    componentDidMount() {
        debugger
    }

    render () {
        return <div>
            <canvas ref="game_canvas" width="800" height="584"/>
        </div>
    }
}