import Device from "../../../Device";
import { glMatrix } from "../../Matrix";
import Camera from "./Camera";
import { CameraFrustum } from "./CameraFrustum";
import enums from "./enums";

export default class PerspectiveCamera extends Camera {
    constructor(fovy, aspect, near, far) {
        super(fovy, aspect, near, far, enums.PROJ_PERSPECTIVE);
        this.test();
    }

    private test(): void {
        this.setRect(0, 0, 1, 1);
    }
    public _frustum:CameraFrustum;
    //显示棱台
    public showFrustum():void{
        // this._frustum = CameraFrustum.create();
    }
    public testDraw(vp:Float32Array,aspect:number,zNear:number,zFar:number,fieldOfView:number) {
        this._frustum.testDraw(vp,aspect,zNear,zFar,fieldOfView)
    }

    public readyDraw(time:number):void{
           super.readyDraw(time);
        //    let vp = glMatrix.mat4.identity(null);
        //    glMatrix.mat4.multiply(vp,this._projectionMatrix,this._modelMatrix);
        //    this._frustum.testDraw(vp,this._aspect,this._near,this._far,this._fovy);
    }

    /**
     * @param time in seconds
     */
    public updateLookAt(time: number): Array<any>|Float32Array {

         // convert to seconds
         time *= 0.001;

        // camera going in circle 2 units from origin looking at origin
        var m4 = this._glMatrix.mat4;
        var cameraPosition = [Math.cos(time * 0.1), 0, Math.sin(time * 0.1)];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        var cameraMatrix = m4.create();
        m4.lookAt(cameraMatrix, cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        var viewMatrix = m4.create();
        m4.invert(viewMatrix, cameraMatrix);

        // We only care about direciton so remove the translation
        viewMatrix[12] = 0;
        viewMatrix[13] = 0;
        viewMatrix[14] = 0;

        var viewDirectionProjectionMatrix = m4.create();
        m4.multiply(viewDirectionProjectionMatrix, this._projectionMatrix, viewMatrix);
        
        var viewDirectionProjectionInverseMatrix = m4.create();
        m4.invert(viewDirectionProjectionInverseMatrix, viewDirectionProjectionMatrix);
        return viewDirectionProjectionInverseMatrix;
    }
}