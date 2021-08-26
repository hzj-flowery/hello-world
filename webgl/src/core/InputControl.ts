import { G_UISetting } from "./ui/UiSetting";

/**
 * 输入控制
 */
class InputControl {
    constructor(){

    }
    
    private _press: boolean;
    private _lastPressPos: Array<number> = [0,0];
    public isCapture: boolean = false;
    public openCapture:boolean = false;//是否开启截图功能

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

   
    public getLastPressPos(){
        return this._lastPressPos;
    }
    private onMouseDown(ev): void {
        this.isCapture = true;
        this._press = true;
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

    }
    private onMouseUp(ev): void {
        this.isCapture = false;
        this._press = false;
        this._lastPressPos = [];
    }
    private onMouseOut(): void {
        this.isCapture = false;
        this._press = false;
        this._lastPressPos = [];
    }
    private onWheel(ev: WheelEvent): void {
        G_UISetting.updateCameraZ(ev.deltaY > 0);
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