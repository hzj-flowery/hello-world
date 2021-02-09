const { ccclass, property } = cc._decorator;

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { G_SignalManager, G_UserData, G_Prompt } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { CakeActivityDataHelper } from '../../../utils/data/CakeActivityDataHelper';
import { Util } from '../../../utils/Util';
import CakeLevelAwardCell from './CakeLevelAwardCell';

@ccclass
export default class PopupCakeLevelAward extends PopupBase {

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _nodeBg: CommonNormalMidPop = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    _curLevel: any;
    _datas: any[];
    _signalGetLevelUpReward: any;


    initData(curLevel) {
        this._curLevel = curLevel;
    }
    onCreate() {
        this._datas = [];
        var name = CakeActivityDataHelper.getFoodName();
        this._nodeBg.setTitle(Lang.get('cake_activity_level_award_title', { name: name }));
        this._nodeBg.addCloseEventListener(handler(this, this._onClickClose));
    }
    onEnter() {
        this._signalGetLevelUpReward = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_GET_LEVEL_UP_REWARD, handler(this, this._onEventGetLevelUpReward));
        this._updateList();
    }
    onExit() {
        this._signalGetLevelUpReward.remove();
        this._signalGetLevelUpReward = null;
    }
    _updateList() {
        this._datas = CakeActivityDataHelper.getLevelAwardInfo(this._curLevel);
        this._listView.content.removeAllChildren();
        this._listView.content.height = 0;
        for (let i = 0; i < this._datas.length; i++) {
            let cell = Util.getNode("prefab/cakeActivity/CakeLevelAwardCell", CakeLevelAwardCell) as CakeLevelAwardCell;
            cell.updateUI(this._datas[i], i);
            cell.setIdx(i);
            cell.setCustomCallback(handler(this, this._onItemTouch));
            this._listView.content.addChild(cell.node);
            this._listView.content.height += 92;
            cell.node.x = 0;
            cell.node.y = -this._listView.content.height;
        }
    }
    _onItemUpdate(item, index) {
        var index = index + 1;
        var data = this._datas[index];
        if (data) {
            item.update(data, index);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
        var data = this._datas[index];
        if (data) {
            G_UserData.getCakeActivity().c2sGetGuildCakeUpLvReward(data.level);
        }
    }
    _onClickClose() {
        this.close();
    }

    _onEventGetLevelUpReward(eventName, awards, upRewardId) {
        this._datas = CakeActivityDataHelper.getLevelAwardInfo(this._curLevel);
        G_Prompt.showAwards(awards);
        var itemList = this._listView.content.children;
        for (let i in itemList) {
            var cellNode = itemList[i];
            var cell = cellNode.getComponent(CakeLevelAwardCell);
            if (cell.getData().level == upRewardId) {
                var index = cell.getTag();
                var data = this._datas[index];
                cell.updateUI(data, index);
            }
        }
    }


}