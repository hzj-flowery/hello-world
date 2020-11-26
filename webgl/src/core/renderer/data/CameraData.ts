
/**
 * 相机数据
 */
export class CameraData{
     constructor(){
         this.reset();
     } 
     //相机的位置
     public position:Array<number>;
     //相机的投影矩阵
     public projectMat:Float32Array;
     //相机的节点矩阵
     public modelMat:Float32Array;
     //相机的视口矩阵
     public viewMat:Float32Array;
     //相机的视口投影矩阵
     public viewProjectionMat:Float32Array;

     public reset():void{
         this.position = [];
         this.projectMat = null;
         this.modelMat = null;
         this.viewMat = null;
         this.viewProjectionMat = null;
     }

}