import * as React from "react";
import {World} from "../simulator/world";
import {RenderingInfo, WorldObject} from "../simulator/world_object";
import {Assembly} from "../simulator/assembly";
import {Box} from "../simulator/objects/box";
import {Vector} from "../simulator/vector";
import {Disc} from "../simulator/objects/disc";
import {Spring} from "../simulator/spring";
import {TorqueGenerator} from "../simulator/torque_generator";
import {Particle} from "../simulator/objects/particle";

export class GameCanvas extends React.Component<{}, {}> {
    ctx: CanvasRenderingContext2D = null;
    intervalID: number = null;
    renderingInfo: RenderingInfo;

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

        // Package up the rendering info
        this.renderingInfo = {
            canvasToGridRatio: this.canvasToGridRatio,
            height: this.height,
            getX: (x: number): number => {
                return x * this.canvasToGridRatio;
            },
            getY: (y: number): number => {
                return this.height - (y * this.canvasToGridRatio)
            },
        };

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

        document.addEventListener("keydown", this.onKeyPress.bind(this));
        canvas.addEventListener("mousedown", this.onMouseDown.bind(this, canvas));
        canvas.addEventListener("mousemove", this.onMouseMove.bind(this, canvas));
        canvas.addEventListener("mouseup", this.onMouseUp.bind(this, canvas));
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

    dragging = false;
    draggingSpring: Spring;
    mouseParticle: WorldObject;
    onMouseDown(canvas, e) {
        if (this.dragging) {
            return
        }
        let v = this.getGridVector(canvas, e);
        let [springPoint, o] = this.simulation.objectUnderPoint(v);
        if (o != null) {
            this.mouseParticle = new Particle(v);
            this.simulation.objects.push(this.mouseParticle);

            this.draggingSpring = new Spring(
                100,
                5,
                this.mouseParticle,
                new Vector(0, 0),
                o,
                springPoint,
            );
            this.simulation.springs.push(this.draggingSpring);
            this.dragging = true;
        }
    }

    onMouseMove(canvas, e) {
        if (this.dragging) {
            this.mouseParticle.position = this.getGridVector(canvas, e);
        }
    }

    onMouseUp(canvas, e) {
        if (this.dragging) {
            this.dragging = false;
            this.simulation.removeObject(this.mouseParticle);
        }
    }

    getGridVector(canvas, e): Vector {
        let x = e.x - canvas.offsetLeft;
        let y = this.height - (e.y - canvas.offsetTop);

        let gridX = x / this.canvasToGridRatio;
        let gridY = y / this.canvasToGridRatio;
        return new Vector(gridX, gridY);
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

        // Draw each object
        for (let object of this.simulation.objects) {
            object.drawSelf(this.ctx, this.renderingInfo);
        }

        // Draw each spring
        for (let spring of this.simulation.springs) {
            spring.drawSelf(this.ctx, this.renderingInfo);
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