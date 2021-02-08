export class LinkedMesh{

        constructor(mesh, skin, slotIndex, parent, inheritDeform){
            this.mesh = mesh;
            this.skin = skin;
            this.slotIndex = slotIndex;
            this.parent = parent;
            this.inheritDeform = inheritDeform;
        }
        return LinkedMesh;
    }