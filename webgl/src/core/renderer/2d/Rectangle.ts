
import { SY } from "../base/Sprite";

export class Rectangle extends SY.Sprite2D {
    constructor() {
        super();
    }
    protected onInit(): void {
        this.color = [1.0,0,0,1.0];
        this.setContentSize(210,210);
    }
}