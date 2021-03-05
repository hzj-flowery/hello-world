const { ccclass, property } = cc._decorator;

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { G_UserData, G_SignalManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { Util } from '../../../utils/Util';
import GuildWarRecordItemCell from './GuildWarRecordItemCell';
import CakeRankGuildCell from '../cakeActivity/CakeRankGuildCell';

@ccclass
export default class PopupGuildWarRecord extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _panelBg: CommonNormalLargePop = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRoot: cc.Sprite = null;
    _signalMemberDataList: any;
    _listData: any[];

    onCreate() {
        this._panelBg.setTitle(Lang.get('guildwar_record_title'));
        this._panelBg.addCloseEventListener(handler(this, this._onClickClose));
        G_UserData.getGuildWar().c2sGuildWarData();
    }
    onEnter() {
        this._signalMemberDataList = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_MEMBER_DATA_LIST, handler(this, this._onEventMemberDataList));
    }
    onExit() {
        this._signalMemberDataList.remove();
        this._signalMemberDataList = null;
    }
    _onEventMemberDataList(event, list) {
        this._updateList(list);
    }
    _onClickClose() {
        this.close();
    }
    _updateList(list) {
        this._listData = list;
        this._listItemSource.content.removeAllChildren();
        this._listItemSource.content.height = 0;
        for (let i = 0; i < this._listData.length; i++) {
            let cell = Util.getNode("prefab/guildwarbattle/GuildWarRecordItemCell", GuildWarRecordItemCell) as GuildWarRecordItemCell;
            this._listItemSource.content.addChild(cell.node);
            cell.updateUI(this._listData[i], i);
            this._listItemSource.content.height += 74;
            cell.node.x = 0;
            cell.node.y = -this._listItemSource.content.height;
        }
    }
    _onItemUpdate(item, index) {
        if (this._listData[index + 1]) {
            item.update(this._listData[index + 1], index + 1);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, reportId) {
    }

}