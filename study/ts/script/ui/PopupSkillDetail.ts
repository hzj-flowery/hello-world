const { ccclass, property } = cc._decorator;

import CommonNormalMidPop from './component/CommonNormalMidPop'
import CommonCustomListView from './component/CommonCustomListView';
import PopupBase from './PopupBase';
import { Lang } from '../lang/Lang';
import { handler } from '../utils/handler';
import PopupSkillDetailCell from './PopupSkillDetailCell';

@ccclass
export default class PopupSkillDetail extends PopupBase {
    public static path = 'common/PopupSkillDetail';

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonBK: CommonNormalMidPop = null;

    @property({
        type: CommonCustomListView,
        visible: true
    })
    _listView: CommonCustomListView = null;

    @property(cc.Prefab)
    popupSkillDetailCell: cc.Prefab = null;
    _skillDescList: any;

    ctor(skillDescList) {
        this._skillDescList = skillDescList || {};
    }
    onCreate() {
        this._listView.removeAllChildren();
        this._commonBK.setTitle(Lang.get('common_skill_detail'));
        this._commonBK.addCloseEventListener(handler(this, this.close));
        for (var i in this._skillDescList) {
            var skillValue = this._skillDescList[i];
            var skillCell = cc.instantiate(this.popupSkillDetailCell).getComponent(PopupSkillDetailCell);
            skillCell.updateUI(skillValue.title, skillValue.skillId, skillValue.pendingStr);
            this._listView.pushBackCustomItem(skillCell.node);
        }
    }
    onEnter() {
    }
    onExit() {
    }
}