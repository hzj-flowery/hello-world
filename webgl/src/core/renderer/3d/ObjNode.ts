import Device from "../../Device";
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { syStateStringKey, syStateStringValue } from "../gfx/State";
import { OBJParseHelper } from "../parse/OBJParseHelper";
var OBJRes = [
  "http:localhost:3000/res/models/windmill/windmill.obj",
  "http:localhost:3000/res/models/chair/chair.obj",
  "http:localhost:3000/res/models/book/book.obj",
  "http:localhost:3000/res/models/Artorias_Sword/Artorias_Sword.obj",
  "http:localhost:3000/res/models/earth/earth.obj",
  "http:localhost:3000/res/models/T-90_uv/T-90_uv.obj",
  "http:localhost:3000/res/models/obj/tree.obj",
  "http:localhost:3000/res/models/obj/walt/WaltHead.obj",
  "http:localhost:3000/res/models/obj/ninja/ninjaHead_Low.obj",
  "http:localhost:3000/res/models/obj/cerberus/Cerberus.obj",
  "http:localhost:3000/res/models/obj/female02/female02.obj",
  "http:localhost:3000/res/models/obj/male02/male02.obj",
]
export default class ObjNode extends SY.SpriteBase {
  constructor() {
    super();
  }
  private _objData: any;
  private _renderDataArray: Array<syRender.QueueItemData> = [];
  protected onInit() {
    this.pushPassContent(syRender.ShaderType.Obj,[
      [syStateStringKey.primitiveType,syStateStringValue.primitiveType.PT_TRIANGLES]
    ])
  }

  private async load() {
    this._objData = await OBJParseHelper.load(Device.Instance.gl, OBJRes[0]);

  }

  protected onUpdate():void{
    this.rotateY = this.rotateY+Math.random()*2;
  }

  protected onLoadShaderFinish(): void {
    this.load();
  }

  protected collectRenderData(time: number): void {

    if (!this.pass || this.pass.length < 0 || !this._objData) {
      return;
    }
    this.rotateX = 0;
    for (let k = 0; k < this.pass.length; k++) {
      let j = 0;

      for (const { bufferInfo, material } of this._objData.parts) {
        var renderData = this._renderDataArray[j];
        if (!renderData) {
          renderData = syRender.DataPool.get(syRender.QueueItemType.Normal) as syRender.QueueItemData;
          this._renderDataArray.push(renderData);
        }
        renderData._shaderData = this.pass[k].program;
        renderData.pass = this.pass[k];
        renderData.primitive.type = this.pass[k].state.primitiveType;
        renderData._uniformData.push({
          u_world: this.modelMatrix
        });
        renderData._uniformData.push(material);
        renderData._attrbufferData = bufferInfo;
        renderData.node = this;
        Device.Instance.collectData(renderData);
        j++;
      }
    }
  }
}