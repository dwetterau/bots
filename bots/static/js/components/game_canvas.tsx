import * as React from "react";
import {World} from "../simulator/world";
import {RenderingInfo} from "../simulator/world_object";

export class GameCanvas extends React.Component<{}, {}> {
    ctx: CanvasRenderingContext2D = null;
    intervalID: number = null;

    // The overall drawing interval for the canvas
    DRAW_INTERVAL: number = 5;

    // The simulation we are rendering
    simulation: World = null;
    width: number = 0;
    height: number = 0;
    widthToGridWidth: number = 0;
    heightToGridHeight: number = 0;

    componentDidMount() {
        let canvas = this.refs['game_canvas'] as HTMLCanvasElement;
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;

        canvas.style.width = this.width + 'px';
        canvas.style.height = this.height + 'px';
        this.widthToGridWidth = this.width / 100.0;
        this.heightToGridHeight = this.height / 100.0;

        this.intervalID = setInterval(this.draw.bind(this), this.DRAW_INTERVAL);
        this.simulation = new World(canvas.width / canvas.height);
    }

    componentWillUnmount() {
        if (this.intervalID) {
            clearInterval(this.intervalID)
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    draw() {
        // Clear the last frame
        this.clear();

        // Update the world
        this.simulation.moveObjects(this.DRAW_INTERVAL);

        // Package up the rendering info
        const renderingInfo: RenderingInfo = {
            heightToGridHeight: this.heightToGridHeight,
            widthToGridWidth: this.widthToGridWidth,
            height: this.height,
        };

        // Draw each object
        for (let object of this.simulation.objects) {
            object.drawSelf(this.ctx, renderingInfo);
        }
    }

    render() {
        return <div>
            <canvas ref="game_canvas" width="800" height="584"/>
        </div>
    }
}