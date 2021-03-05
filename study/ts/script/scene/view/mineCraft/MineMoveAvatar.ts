const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import { Colors, G_UserData } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { BaseData } from '../../../data/BaseData';
import { UserBaseData } from '../../../data/UserBaseData';
import ViewBase from '../../ViewBase';

@ccclass
export default class MineMoveAvatar extends ViewBase {

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOfficial: cc.Label = null;
    constructor() {
        super();
    }

    onCreate() {
        this.node.name = "MineMoveAvatar";
        this._heroAvatar.init();
    }
    onEnter() {
    }
    onExit() {
    }
    updateUI(heroId, name, officel, limit, titleId) {
        this._heroAvatar.init();
        this._heroAvatar.updateUI(heroId, null, null, limit);
        this._textName.string = (name);
        this._textName.node.color = (Colors.getOfficialColor(officel));
        UIHelper.enableOutline(this._textName, Colors.getOfficialColorOutline(officel), 2);
        var [officalInfo, officalLevel] = G_UserData.getBase().getOfficialInfo(officel);
        if (officalLevel <= 0) {
            this._textOfficial.node.active = (false);
            return;
        }
        this._textOfficial.node.color = (Colors.getOfficialColor(officalLevel));
        UIHelper.enableOutline(this._textOfficial, officalLevel, 2)
        this._textOfficial.node.active = (true);
        this._textOfficial.string = ('[' + (officalInfo.name + ']'));
        this._heroAvatar.showTitle(titleId, "MineMoveAvatar");
    }
    setAction(action, loop) {
        this._heroAvatar.setAction(action, loop);
    }
    turnBack(needTurn) {
        this._heroAvatar.turnBack(needTurn);
    }

}