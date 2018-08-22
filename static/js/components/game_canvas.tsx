import * as React from "react";
import {World} from "../simulator/world";
import {RenderingInfo, WorldObject} from "../simulator/world_object";
import {Vector} from "../simulator/vector";
import {Spring} from "../simulator/spring";
import {TorqueGenerator} from "../simulator/torque_generator";
import {Particle} from "../simulator/objects/particle";
import {Bot, BotSpec} from "../game/bot";
import {Weapon} from "../game/weapon";


const DefaultSpec: BotSpec = {
    bodySpec: {
        width: 20,
        height: 8,
        mass: 20,
    },
    wheelSpec: {
        radius: 3,
        mass: 5,
        offsetX: 5,
        offsetY: -4,
    },
};


export class GameCanvas extends React.Component<{}, {}> {
    ctx: CanvasRenderingContext2D = null;
    intervalID: number = null;
    renderingInfo: RenderingInfo;

    // The overall drawing interval for the canvas
    DRAW_INTERVAL: number = 16;

    // The simulation we are rendering
    simulation: World = null;
    width: number = 0;
    height: number = 0;
    canvasToGridRatio: number = 0;
    
    // Actual game state
    bots: Array<Bot>;
    specText: Array<string> = [
        JSON.stringify(DefaultSpec, null, 4),
        JSON.stringify(DefaultSpec, null, 4),
    ];
    initialOffsetX = 15;
    initialOffsetY = 5;
    wheelTorque = 500;
    wheelGovernor = 6;
    wheelMotors: Array<TorqueGenerator>;
    weapons: Array<Weapon>;

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

        this.resetGame();

        document.addEventListener("keydown", this.onKeyPress.bind(this));
        canvas.addEventListener("mousedown", this.onMouseDown.bind(this, canvas));
        canvas.addEventListener("mousemove", this.onMouseMove.bind(this, canvas));
        canvas.addEventListener("mouseup", this.onMouseUp.bind(this, canvas));
    }

    resetGame() {
        let specs = this.parseSpecs();
        this.bots = [];
        this.wheelMotors = [
            new TorqueGenerator(-this.wheelTorque, this.wheelGovernor),
            new TorqueGenerator(this.wheelTorque, this.wheelGovernor),
        ];
        this.weapons = [];
        this.simulation.reset();

        // TODO(davidw): Parse the assembly out from an input
        for (let [i, spec] of specs.entries()) {
            let x = (i == 1) ? this.simulation.width - this.initialOffsetX: this.initialOffsetX;
            let y = this.initialOffsetY + spec.bodySpec.height / 2 + spec.wheelSpec.radius;
            this.bots.push(new Bot(new Vector(x, y), spec));
            this.bots[i].addWheelMotor(this.wheelMotors[i]);
            this.simulation.addAssembly(this.bots[i]);
        }

        /*
        // hackily add a weapon...
        this.weapons.push(new Weapon(
            {
                reloadTime: 1,
                muzzleSpeed: 80,
                projectileSpec: {
                    height: .2,
                    length: 1,
                },
            },
            this.bots[0].objects[0],
            new Vector(specs[0].bodySpec.width / 2, specs[0].bodySpec.height / 2),
            Math.PI / 4,
        ));
        */
    }

    parseSpecs(): Array<BotSpec> {
        let specs: Array<BotSpec> = [];
        for (let i of [0, 1]) {
            let specString: string = (this.refs[`bot${i + 1}_spec`] as HTMLTextAreaElement).value;
            specs.push(JSON.parse(specString));
        }
        return specs;
    }
    
    onSpecChange(botIndex: number, event) {
        this.specText[botIndex] = event.target.value;
    }

    onResetPush() {
        this.resetGame();
    }

    onKeyPress(e) {
        // a
        if (e.which == 65) {
            this.wheelMotors[0].torque = Math.abs(this.wheelMotors[0].torque)
        }
        // d
        if (e.which == 68) {
            this.wheelMotors[0].torque = -Math.abs(this.wheelMotors[0].torque)
        }

        // left
        if (e.which == 37) {
            this.wheelMotors[1].torque = Math.abs(this.wheelMotors[1].torque)
        }

        // right
        if (e.which == 39) {
            this.wheelMotors[1].torque = -Math.abs(this.wheelMotors[1].torque)
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
            this.simulation.addObject(this.mouseParticle);

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

    timingTotals = {
        physicsTime: 0,
        drawTime: 0,
        waitTime: 0,
        lastTime: 0,
        frames: 0,
    };
    draw() {
        let timingStats = {
            startTime: new Date().getTime(),
            clearTime: 0,
            physicsTime: 0,
            drawTime: 0,
        };

        // Clear the last frame
        this.clear();
        timingStats.clearTime = new Date().getTime();

        // Update the world
        // Note: This couples together the physics time and the drawing time. We could
        // update the physics more accurately and draw separately.
        let dt = this.DRAW_INTERVAL / 1000.0;
        /*
        // Fire the weapons
        for (let w of this.weapons) {
            let possibleProjectile = w.fire(dt);
            if (possibleProjectile != null) {
                console.log(possibleProjectile);
                this.simulation.addAssembly(possibleProjectile)
            }
        }
        */
        this.simulation.moveObjects(dt);
        timingStats.physicsTime = new Date().getTime();

        // Draw each object
        for (let object of this.simulation.objects) {
            object.drawSelf(this.ctx, this.renderingInfo);
        }

        // Draw each spring
        for (let spring of this.simulation.springs) {
            spring.drawSelf(this.ctx, this.renderingInfo);
        }
        timingStats.drawTime = new Date().getTime();

        let physicsTime = timingStats.physicsTime - timingStats.clearTime;
        let drawTime = timingStats.drawTime - timingStats.physicsTime;
        drawTime += timingStats.clearTime - timingStats.startTime;

        if (this.timingTotals.lastTime != 0) {
            this.timingTotals.waitTime += timingStats.startTime - this.timingTotals.lastTime
        }
        this.timingTotals.physicsTime += physicsTime;
        this.timingTotals.drawTime += drawTime;

        // Draw stats
        this.ctx.fillStyle = "#000000";
        let y = 10;

        let total = this.timingTotals.physicsTime
            + this.timingTotals.drawTime
            + this.timingTotals.waitTime;
        let pPerc = Math.round(this.timingTotals.physicsTime / total * 100);
        let dPerc = Math.round(this.timingTotals.drawTime / total * 100);
        let wPerc = Math.round(this.timingTotals.waitTime / total * 100);
        let fps = Math.round(this.timingTotals.frames * 1000 / total);
        this.ctx.fillText(`fps: ${fps} phys:${pPerc}% draw:${dPerc}% wait:${wPerc}%`, 10, y);
        y += 10;

        for (let stats of this.simulation.stats()) {
            this.ctx.fillText(stats, 10, y);
            y += 10;
        }

        this.timingTotals.lastTime = new Date().getTime();
        this.timingTotals.frames += 1;
    }

    render() {
        return <div>
            <canvas
                ref="game_canvas"
                width="800"
                height="584"
            />
            <div className="bot-containers">
                <div className="bot-container">
                    Bot 1 spec
                    <textarea
                        ref="bot1_spec"
                        onChange={this.onSpecChange.bind(this, 0)}
                        defaultValue={this.specText[0]}
                    />
                </div>
                <div className="bot-container">
                    Bot 2 spec
                    <textarea
                        ref="bot2_spec"
                        onChange={this.onSpecChange.bind(this, 1)}
                        defaultValue={this.specText[1]}
                    />
                </div>
            </div>
            <input type="button" onClick={this.onResetPush.bind(this)} value="Reset" />
        </div>
    }
}