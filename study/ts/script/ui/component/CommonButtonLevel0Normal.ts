import CommonButtonNormal from "./CommonButtonNormal";
import { Path } from "../../utils/Path";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonButtonLevel0Normal extends CommonButtonNormal {

    protected _btnType:number = 1; //1表示不做处理 2表示浅黄色按钮 3表示深黄色按钮
    public setBtnType(type):void{
        this._btnType = type;
    }

    onLoad() {
        if(this._btnType==1)
        this.loadTexture(Path.getUICommon("img_btn_ctrl_large01_nml"), null, null);
        else
        this.loadTexture(Path.getUICommon("img_btn_ctrl_large02_nml"), null, null);
    }
    //浅黄色按钮
    public switchNormal():void{
        this.loadTexture(Path.getUICommon("img_btn_ctrl_small01_nml"), null, null);
    }
}