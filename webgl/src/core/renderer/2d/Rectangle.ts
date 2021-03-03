
import LoaderManager from "../../LoaderManager";
import { SY } from "../base/Sprite";
import enums from "../camera/enums";

export class Rectangle extends SY.Sprite2D {
    constructor() {
        super();
    }
    protected onInit(): void {
        this.setContentSize(210,210);
    }
}