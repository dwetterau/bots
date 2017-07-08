import * as React from "react";
import {World} from "../simulator/world";
import {RenderingInfo} from "../simulator/world_object";
import {Assembly} from "../simulator/assembly";
import {Box} from "../simulator/objects/box";
import {Vector} from "../simulator/vector";
import {Disc} from "../simulator/objects/disc";
import {Spring} from "../simulator/spring";
import {TorqueGenerator} from "../simulator/torque_generator";

export class GameCanvas extends React.Component<{}, {}> {
    ctx: CanvasRenderingContext2D = null;
    intervalID: number = null;

    // The overall drawing interval for the canvas
    DRAW_INTERVAL: number = 5;

    // The simulation we are rendering
    simulation: World = null;
    width: number = 0;
    height: number = 0;
    canvasToGridRatio: number = 0;
    wheelMotor1: TorqueGenerator;
    wheelMotor2: TorqueGenerator;

    componentDidMount() {
        let canvas = this.refs['game_canvas'] as HTMLCanvasElement;
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;

        canvas.style.width = this.width + 'px';
        canvas.style.height = this.height + 'px';

        let gridWidth = Math.round(100 * canvas.width / canvas.height);
        this.canvasToGridRatio = this.height / 100;

        this.intervalID = setInterval(this.draw.bind(this), this.DRAW_INTERVAL);
        this.simulation = new World(100, gridWidth);

        let bot = this.createBot(new Vector(15, 10));
        this.wheelMotor1 = new TorqueGenerator(-500, 6);
        bot.objects[1].torqueGenerator = this.wheelMotor1;
        bot.objects[2].torqueGenerator = this.wheelMotor1;
        this.simulation.addAssembly(bot);

        let bot2 = this.createBot(new Vector(85, 10));
        this.wheelMotor2 = new TorqueGenerator(500, 6);
        bot2.objects[1].torqueGenerator = this.wheelMotor2;
        bot2.objects[2].torqueGenerator = this.wheelMotor2;
        this.simulation.addAssembly(bot2);

        document.addEventListener("keydown", this.onKeyPress.bind(this))
    }

    createBot(p: Vector): Assembly {
        let bot = new Assembly();
        bot.setObjects([
            new Box(
                p,
                20,  // mass
                10,  // halfX
                4,   // halfY
            ),
            new Disc(
                new Vector(p.a - 5, p.b - 4),
                5,  // mass
                3,  // radius
            ),
            new Disc(
                new Vector(p.a + 5, p.b - 4),
                5,  // mass
                3,  // radius
            ),
        ]);
        bot.setSprings([
            new Spring(
                50000,
                .5,
                bot.objects[0],
                new Vector(-4, -4),
                bot.objects[1],
                new Vector(0, 0),
            ),
            new Spring(
                50000,
                .5,
                bot.objects[0],
                new Vector(-6, -4),
                bot.objects[1],
                new Vector(0, 0),
            ),
            new Spring(
                50000,
                .5,
                bot.objects[0],
                new Vector(4, -4),
                bot.objects[2],
                new Vector(0, 0),
            ),
            new Spring(
                50000,
                .5,
                bot.objects[0],
                new Vector(6, -4),
                bot.objects[2],
                new Vector(0, 0),
            )
        ]);
        return bot;
    }

    onKeyPress(e) {
        // a
        if (e.which == 65) {
            this.wheelMotor1.torque = Math.abs(this.wheelMotor1.torque)
        }
        // d
        if (e.which == 68) {
            this.wheelMotor1.torque = -Math.abs(this.wheelMotor1.torque)
        }

        // left
        if (e.which == 37) {
            this.wheelMotor2.torque = Math.abs(this.wheelMotor2.torque)
        }

        // right
        if (e.which == 39) {
            this.wheelMotor2.torque = -Math.abs(this.wheelMotor2.torque)
        }
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
            canvasToGridRatio: this.canvasToGridRatio,
            height: this.height,
            getX: (x: number): number => {
                return x * renderingInfo.canvasToGridRatio;
            },
            getY: (y: number): number => {
                return renderingInfo.height - (y * renderingInfo.canvasToGridRatio)
            },
        };

        // Draw each object
        for (let object of this.simulation.objects) {
            object.drawSelf(this.ctx, renderingInfo);
        }

        // Draw each spring
        for (let spring of this.simulation.springs) {
            spring.drawSelf(this.ctx, renderingInfo);
        }

        // Draw stats
        this.ctx.fillStyle = "#000000";
        let y = 10;
        for (let stats of this.simulation.stats()) {
            this.ctx.fillText(stats, 10, y);
            y += 10;
        }
    }

    render() {
        return <div>
            <canvas
                ref="game_canvas"
                width="800"
                height="584"
            />
        </div>
    }
}