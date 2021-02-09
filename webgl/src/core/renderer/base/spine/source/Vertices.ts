export class Vertices{
public bones:any;
public vertices:any;

        constructor(bones, vertices){
            if (bones === void 0) { bones = null; }
            if (vertices === void 0) { vertices = null; }
            this.bones = bones;
            this.vertices = vertices;
        }
       
    }
