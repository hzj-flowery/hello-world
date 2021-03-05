const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import { Colors, G_UserData } from '../../../init';
import { Path } from '../../../utils/Path';
import CommonUI from '../../../ui/component/CommonUI';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import PopupItemGuider from '../../../ui/PopupItemGuider';

@ccclass
export default class TeamYokeConditionNode extends cc.Widget {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMark: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMark2: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _fileNodeIcon1: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _fileNodeIcon2: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _fileNodeIcon3: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _fileNodeIcon4: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _fileNodeIcon5: CommonIconTemplate = null;

    private _fateType:number;
    onLoad() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateView(info) {
        this._textName.string = ('\u3010' + (info.name + '\u3011'));
        var color = info.isActivated && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
        this._textName.node.color = (color);
        var res = info.isActivated && Path.getUICommon('img_com_team_sign01') || Path.getUICommon('img_com_team_sign06');
        this._imageMark.addComponent(CommonUI).loadTexture(res);
        this._imageMark2.node.active = (info.isActivated);
        var heroIds = info.heroIds;
        this._fateType = info.fateType;
        for (var i = 1;i<=5;i++) {
            var heroId = heroIds[i-1];
            if (heroId) {
                (this['_fileNodeIcon' + i] as CommonIconTemplate).node.active = (true);
                (this['_fileNodeIcon' + i] as CommonIconTemplate).initUI(info.fateType, heroId);
                (this['_fileNodeIcon' + i] as CommonIconTemplate).setCallBack(handler(this, this._onClickIcon));
                (this['_fileNodeIcon' + i] as CommonIconTemplate).setTouchEnabled(true);
                if (this._isHave(info.fateType, heroId)) {
                    (this['_fileNodeIcon' + i] as CommonIconTemplate).setIconMask(false);
                } else {
                    (this['_fileNodeIcon' + i] as CommonIconTemplate).setIconMask(true);
                }
            } else {
                (this['_fileNodeIcon' + i] as CommonIconTemplate).node.active = (false);
            }
        }
    }
    _isHave(type, id) {
        if (type == 1) {
            return G_UserData.getTeam().isInBattleWithBaseId(id) || G_UserData.getTeam().isInReinforcementsWithBaseId(id);
        }else if (type ==2) {
            return G_UserData.getBattleResource().isEquipInBattleWithBaseId(id);
        } else if(type == 3) {
            return G_UserData.getBattleResource().isTreasureInBattleWithBaseId(id);
        }
        else if (type == 4) {
            return G_UserData.getBattleResource().isInstrumentInBattleWithBaseId(id);
        }
    }
    _onClickIcon(sender, itemParam) {
        UIPopupHelper.popupItemGuider(function(popupItemGuider:PopupItemGuider){
            popupItemGuider.updateUI(this._fateType, itemParam.cfg.id);
            popupItemGuider.setTitle(Lang.get('way_type_get'));
        }.bind(this))
    }
    onlyShow(info) {
        this._textName.string = ('\u3010' + (info.name + '\u3011'));
        var color = info.isActivated && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
        this._textName.node.color = (color);
        var res = info.isActivated && Path.getUICommon('img_sign01') || Path.getUICommon('img_sign01b');
        this._imageMark.addComponent(CommonUI).loadTexture(res);
        this._imageMark2.node.active = (info.isActivated);
        var heroIds = info.heroIds;
        for (var i = 1;i<=5;i++) {
            var heroId = heroIds[i-1];
            if (heroId) {
                (this['_fileNodeIcon' + i] as CommonIconTemplate).node.active = (true);
                (this['_fileNodeIcon' + i] as CommonIconTemplate).initUI(info.fateType, heroId);
                (this['_fileNodeIcon' + i] as CommonIconTemplate).setIconMask(!info.isActivated);
            } else {
                (this['_fileNodeIcon' + i] as CommonIconTemplate).node.active = (false);
            }
        }
    }

}
