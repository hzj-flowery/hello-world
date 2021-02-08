export class BoneData {
    public x: number;
    public y: number;
    public rotation: number;
    public scaleX: number;
    public scaleY: number;
    public shearX: number;
    public shearY: number;
    public transformMode: number;
    public skinRequired: boolean;
    public color: any;
    public index: number;
    public name: string;
    public parent: any;
    constructor(index, name, parent) {
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.shearX = 0;
        this.shearY = 0;
        this.transformMode = TransformMode.Normal;
        this.skinRequired = false;
        this.color = new spine.Color();
        if (index < 0)
            throw new Error("index must be >= 0.");
        if (name == null)
            throw new Error("name cannot be null.");
        this.index = index;
        this.name = name;
        this.parent = parent;
    }
}