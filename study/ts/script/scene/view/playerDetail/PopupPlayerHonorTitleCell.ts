const { ccclass, property } = cc._decorator;

import CommonButtonSwitchLevel2 from '../../../ui/component/CommonButtonSwitchLevel2'
import { handler } from '../../../utils/handler';
import HonorTitleConst from '../../../const/HonorTitleConst';
import { PopupHonorTitleHelper } from './PopupHonorTitleHelper';
import { Colors, G_Prompt, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';

@ccclass
export default class PopupPlayerHonorTitleCell extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonButtonSwitchLevel2,
        visible: true
    })
    _btnClick: CommonButtonSwitchLevel2 = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _line2: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _titleDesc: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _titleDescTime: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _titleImage: cc.Node = null;

    private _less = false;
    private _cellValue;

    public onLoad() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._btnClick.addClickEventListenerEx(handler(this, this._onBtnClick));
        var delay = cc.delayTime(1);
        var sequence = cc.sequence(delay, cc.callFunc(() => {
            if (this._cellValue.getTimeType() == HonorTitleConst.TIME_TYPE_LIMIT) {
                if (this._less) {
                    var dateStr = PopupHonorTitleHelper.getExpireTimeString(this._cellValue.getExpireTime())[0];
                    this._titleDescTime.string = (dateStr);
                }
            }
        }));
        var action = cc.repeatForever(sequence);
        this.node.runAction(action);
    }

    public updateUI(index, cellValue) {
        this.node.name = ('PopupHonorTitleItemCell' + index);
        this._cellValue = cellValue;
        this._btnClick.setVisible(this._cellValue.isIsOn());
        this._less = false;
        if (cellValue.getTimeType() == HonorTitleConst.TIME_TYPE_LIMIT) {
            this._titleDescTime.node.color = (Colors.SYSTEM_TARGET_RED);
            var [dateStr, less] = PopupHonorTitleHelper.getExpireTimeString(cellValue.getExpireTime());
            this._less = less;
            this._titleDescTime.string = (dateStr);
        } else {
            this._titleDescTime.node.color = (Colors.SYSTEM_TARGET);
            this._titleDescTime.string = (Lang.get('honor_title_permanent'));
        }
        if (this._cellValue.isIsEquip()) {
            this._btnClick.switchToNormal();
            this._btnClick.setString(Lang.get('honor_title_unload'));
        } else {
            this._btnClick.switchToHightLight();
            this._btnClick.setString(Lang.get('honor_title_equip'));
        }
        this._titleDesc.string = (cellValue.getDes());
        UserDataHelper.appendNodeTitle(this._titleImage, cellValue.getId(), "PopupHonorTitleItemCell");
    }

    public _onBtnClick() {
        if (!PopupHonorTitleHelper.enoughLevelAndOpendayByTitleId(this._cellValue.getId())) {
            G_Prompt.showTip(Lang.get('honor_title_not_satisfied'));
            return;
        }
        if (this._cellValue.isIsEquip()) {
            G_UserData.getTitles().c2sEquipTitleInfo(HonorTitleConst.TITLE_UNLOAD_ID);
        } else {
            G_UserData.getTitles().c2sEquipTitleInfo(this._cellValue.getId());
        }
    }
}