export class TextureRegion {
    public  u :number;
    public  v :number;
    public  u2 :number;
    public  v2 :number;
    public  width :number;
    public  height :number;
    public  rotate :boolean;
    public  offsetX :number;
    public  offsetY :number;
    public  originalWidth :number;
    public  originalHeight :number;
    constructor() {
        this.u = 0;
        this.v = 0;
        this.u2 = 0;
        this.v2 = 0;
        this.width = 0;
        this.height = 0;
        this.rotate = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.originalWidth = 0;
        this.originalHeight = 0;
    }
}