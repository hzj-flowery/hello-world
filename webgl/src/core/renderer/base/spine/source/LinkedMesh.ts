export class LinkedMesh{
public mesh:any;
public skin:any;
public slotIndex:any;
public parent:any;
public inheritDeform:any;

        constructor(mesh, skin, slotIndex, parent, inheritDeform){
            this.mesh = mesh;
            this.skin = skin;
            this.slotIndex = slotIndex;
            this.parent = parent;
            this.inheritDeform = inheritDeform;
        }
       
    }
