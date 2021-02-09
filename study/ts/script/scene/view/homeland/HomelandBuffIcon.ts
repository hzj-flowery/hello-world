import { HomelandConst } from "../../../const/HomelandConst";
import { handler } from "../../../utils/handler";
import { G_UserData, G_SceneManager } from "../../../init";
import HomelandBuffStateNode from "./HomelandBuffStateNode";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomelandBuffIcon extends cc.Component {
    _showType: any;
    _showBuffId: number;
    _buttonIcon: cc.Button;

    onLoad() {
        this._showType = HomelandConst.SHOW_ALL_BUFF;
        this._showBuffId = 0;
        this._buttonIcon = this.node.getChildByName('ButtonIcon').getComponent(cc.Button);
        UIHelper.addEventListener(this.node, this._buttonIcon, 'HomelandBuffIcon', '_onClickIcon');
    }
    updateUI() {
        var datas = G_UserData.getHomeland().getBuffDatasBySort();
        var visible = datas.length > 0;
        this.node.active = (visible);
        this._showType = HomelandConst.SHOW_ALL_BUFF;
    }
    updateOneBuffById(id) {
        var datas = G_UserData.getHomeland().getBuffDatasWithBaseId(id);
        var visible = datas.length > 0;
        this.node.active = (visible);
        this._showBuffId = id;
        this._showType = HomelandConst.SHOW_ONE_BUFF;
    }
    _onClickIcon() {
        var popupView = G_SceneManager.getRunningScene().getPopupByName('HomelandBuffStateNode');
        if (popupView) {
            popupView.getComponent(HomelandBuffStateNode).close();
        } else {
            G_SceneManager.openPopup('prefab/homeland/HomelandBuffStateNode', (p: HomelandBuffStateNode) => {
                p.ctor(this.node, this._showBuffId)
                p.open();
            });
        }
    }
}