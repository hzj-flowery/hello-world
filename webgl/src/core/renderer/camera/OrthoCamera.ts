import { syRender } from "../data/RenderData";
import Camera from "./Camera";
import enums from "./enums";

export default class OrthoCamera extends Camera{
    constructor(fovy,aspect,near,far){
        super(fovy,aspect,near,far,syRender.CameraType.Ortho);
    }
}