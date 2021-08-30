import { G_UISetting } from "./ui/UiSetting";

/**
 * 输入控制
 */
class InputControl {
    constructor() {

    }

    private _press: boolean;
    private _lastPressPos: Array<number> = [0, 0];
    private _listenMouseDownEvent: Array<Function> = []; //监听鼠标按下的事件
    private _listenMouseMoveEvent: Array<Function> = []; //监听鼠标移动的事件
    private _listenMouseUpEvent: Array<Function> = []; //监听鼠标放开的事件
    private _listenMouseWheelEvent: Array<Function> = []; //监听鼠标滑轮滚动的事件
    private _listenMouseOutEvent: Array<Function> = []; //监听鼠标离开的事件
    public isCapture: boolean = false;
    public openCapture: boolean = false;//是否开启截图功能

    public handleEvent(canvas: HTMLCanvasElement): void {
        //添加事件监听
        canvas.onmousedown = this.onMouseDown.bind(this);
        canvas.onmousemove = this.onMouseMove.bind(this);
        canvas.onmouseup = this.onMouseUp.bind(this);
        canvas.onwheel = this.onWheel.bind(this);
        canvas.onmouseout = this.onMouseOut.bind(this);
        canvas.onkeydown = this.onKeyDown.bind(this);

        canvas.addEventListener("webglcontextlost", this.contextLost.bind(this));
        canvas.addEventListener("webglcontextrestored", this.resume.bind(this));
    }

    public registerMouseDownEvent(func: Function): void {
        if(this._listenMouseDownEvent.indexOf(func)>=0)
        {
            return;
        }
        this._listenMouseDownEvent.push(func);
    }
    public registerMouseMoveEvent(func: Function): void {
        if(this._listenMouseMoveEvent.indexOf(func)>=0)
        {
            return;
        }
        this._listenMouseMoveEvent.push(func);
    }
    public registerMouseUpEvent(func: Function): void {
        if(this._listenMouseUpEvent.indexOf(func)>=0)
        {
            return;
        }
        this._listenMouseUpEvent.push(func);
    }
    public registerMouseWheelEvent(func: Function): void {
        if(this._listenMouseWheelEvent.indexOf(func)>=0)
        {
            return;
        }
        this._listenMouseWheelEvent.push(func);
    }
    public registerMouseOutEvent(func: Function): void {
        if(this._listenMouseOutEvent.indexOf(func)>=0)
        {
            return;
        }
        this._listenMouseOutEvent.push(func);
    }

    public getLastPressPos() {
        return this._lastPressPos;
    }
    private onMouseDown(ev:MouseEvent,value): void {
        this.isCapture = true;
        this._press = true;
        if(this._listenMouseDownEvent.length>0)
        {
            for(var k = 0;k<this._listenMouseDownEvent.length;k++)
            {
                this._listenMouseDownEvent[k](ev)
            }
        }
    }
    private onMouseMove(ev: MouseEvent, value): void {
        if (this._press) {
            //处理鼠标滑动逻辑
            if (this._lastPressPos.length == 0) {
                //本次不做任何操作
                this._lastPressPos[0] = ev.x;
                this._lastPressPos[1] = ev.y;
            }
            else {
                let detaX = ev.x - this._lastPressPos[0];
                let detaY = ev.y - this._lastPressPos[1];
                if (Math.abs(detaX) > Math.abs(detaY)) {
                    //处理x轴方向
                    G_UISetting.updateCameraX(detaX > 0)
                }
                else {
                    //处理y轴方向
                    G_UISetting.updateCameraY(detaY < 0);
                }
                this._lastPressPos[0] = ev.x;
                this._lastPressPos[1] = ev.y;
            }

        }


        if(this._listenMouseMoveEvent.length>0)
        {
            for(var k = 0;k<this._listenMouseMoveEvent.length;k++)
            {
                this._listenMouseMoveEvent[k](ev)
            }
        }

    }
    private onMouseUp(ev:MouseEvent): void {
        this.isCapture = false;
        this._press = false;
        this._lastPressPos = [];

        if(this._listenMouseUpEvent.length>0)
        {
            for(var k = 0;k<this._listenMouseUpEvent.length;k++)
            {
                this._listenMouseUpEvent[k](ev)
            }
        }
    }
    private onMouseOut(ev:MouseEvent): void {
        this.isCapture = false;
        this._press = false;
        this._lastPressPos = [];

        if(this._listenMouseOutEvent.length>0)
        {
            for(var k = 0;k<this._listenMouseOutEvent.length;k++)
            {
                this._listenMouseOutEvent[k](ev)
            }
        }
    }
    private onWheel(ev: WheelEvent): void {
        G_UISetting.updateCameraZ(ev.deltaY > 0);

        if(this._listenMouseWheelEvent.length>0)
        {
            for(var k = 0;k<this._listenMouseWheelEvent.length;k++)
            {
                this._listenMouseWheelEvent[k](ev)
            }
        }
    }
    private onKeyDown(key): void {
        console.log("key---------", key);
    }

    private contextLost(): void {
        console.log("丢失上下文----");
    }
    private resume(): void {
        console.log("回来-----");
    }


}

export var G_InputControl = new InputControl()