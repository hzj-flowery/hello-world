
import { SY } from "../base/Sprite";

export class Rectangle extends SY.Sprite2D {
    constructor() {
        super();
    }
    protected onInit(): void {
        this.setContentSize(210,210);
    }
}