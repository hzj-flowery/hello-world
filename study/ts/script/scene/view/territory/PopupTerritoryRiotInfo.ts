const { ccclass, property } = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { TerritoryConst } from '../../../const/TerritoryConst';
import { Colors, G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import UIHelper from '../../../utils/UIHelper';
import PopupTerritoryRiotInfoCell from './PopupTerritoryRiotInfoCell';
import { TerritoryHelper } from './TerritoryHelper';


@ccclass
export default class PopupTerritoryRiotInfo extends PopupBase {

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _imageNoTimes: CommonEmptyListNode = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listViewItem: cc.ScrollView = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_2: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textTitleDesc: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProcess: cc.Node = null;
    _title: string;
    _textTitle: any;
    _btnClose: any;
    _labelMaxRank: any;
    _riotInfos: any[];
    _getRiotHelper: any;
    _getRiotAward: any;


    initData() {
        this._title = Lang.get('lang_territory_riot_title');
        this._textTitle = null;
        this._btnClose = null;
        this._labelMaxRank = null;
        this._riotInfos = [];
    }
    onCreate() {
        this.initData();
        this._commonNodeBk.setTitle(this._title);
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._imageNoTimes.node.active = (false);
        this._textTitleDesc.string = (TerritoryHelper.getTerritoryParameter('time_display'));
        this._updateListView();
    }
    _updateListView() {
        // var listView = this._listViewItem;
        // listView.clearAll();
        // listView.setTemplate(PopupTerritoryRiotInfoCell);
        // listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // listView.setCustomCallback(handler(this, this._onItemTouch));
        this._riotInfos = G_UserData.getTerritory().getAllRiotEvents();
        if (this._riotInfos.length == 0) {
            this._imageNoTimes.node.active = (true);
        } else {
            this._imageNoTimes.node.active = (false);
        }
        this._listViewItem.content.removeAllChildren();

        //更新任务的数据
        for (let i = 0; i < this._riotInfos.length; i++) {
            if (this._riotInfos[i]) {
                var resource = cc.resources.get("prefab/territory/PopupTerritoryRiotInfoCell");
                var node1 = cc.instantiate(resource) as cc.Node;
                let cell = node1.getComponent(PopupTerritoryRiotInfoCell) as PopupTerritoryRiotInfoCell;
                this._listViewItem.content.addChild(cell.node);
                cell.setIdx(i);
                cell.setCustomCallback(handler(this, this._onItemTouch));
                cell.node.y = -160 - i * 160;
                cell.updateUI(i, this._riotInfos[i]);
                this._listViewItem.content.setContentSize(478, (i + 1) * 160);
            }
        }
        this._listViewItem.scrollToTop();

        this._updateRiotProcess();
    }
    _onItemTouch(index, res) {
        var stateIndex = res[0];
        var riotEvent = res[1];
        // assert(stateIndex, 'PopupTerritoryRiotInfo:_onItemTouch, awardId is null');
        if (stateIndex && stateIndex > 0 && riotEvent) {
            if (stateIndex == TerritoryConst.RIOT_HELP) {
                var territoryId = parseInt(riotEvent.territory_id);
                var isInGuild = G_UserData.getGuild().isInGuild();
                if (isInGuild == false) {
                    G_Prompt.showTip(Lang.get('auction_no_guild'));
                    return;
                }
                G_UserData.getTerritory().c2sTerritoryForHelp(territoryId, riotEvent.id);
            }
            if (stateIndex == TerritoryConst.RIOT_TAKE) {
                var territoryId = parseInt(riotEvent.territory_id);
                G_UserData.getTerritory().c2sGetTerritoryRiotAward(territoryId, riotEvent.id);
            }
        }
    }
    _onItemUpdate(item, index) {
        if (this._riotInfos[index + 1]) {
            item.updateUI(index, this._riotInfos[index + 1]);
        }
    }
    _onItemSelected(item, index) {
    }
    onEnter() {
        this._getRiotHelper = G_SignalManager.add(SignalConst.EVENT_TERRITORY_FORHELP, handler(this, this._onGetRiotHelper));
        this._getRiotAward = G_SignalManager.add(SignalConst.EVENT_TERRITORY_GET_RIOT_AWARD, handler(this, this._onGetRiotAward));
    }
    onExit() {
        this._getRiotHelper.remove();
        this._getRiotHelper = null;
        this._getRiotAward.remove();
        this._getRiotAward = null;
    }
    onBtnCancel() {
        this.close();
    }
    _updateRiotProcess() {
        this._nodeProcess.removeAllChildren();
        if (this._riotInfos.length <= 0) {
            this._image_2.node.x = -140;
            this._textTitleDesc.node.x = -120;
            return;
        }
        var totalCount = this._riotInfos.length;
        var finishState = 0;
        for (var i in this._riotInfos) {
            var event = this._riotInfos[i];
            var state = TerritoryHelper.getRiotEventState(event);
            if (state == TerritoryConst.RIOT_TAKEN) {
                finishState = finishState + 1;
            }
        }
        var richTextColor1 = Colors.BRIGHT_BG_RED;
        if (finishState >= totalCount) {
            richTextColor1 = Colors.BRIGHT_BG_GREEN;
        } else {
            richTextColor1 = Colors.BRIGHT_BG_RED;
        }
        var richTextColor2 = Colors.BRIGHT_BG_ONE;
        if (finishState >= totalCount) {
            richTextColor2 = Colors.BRIGHT_BG_GREEN;
        }
        var richText = Lang.get('lang_territory_riot_process', {
            num: finishState,
            color1: Colors.colorToNumber(richTextColor1),
            color2: Colors.colorToNumber(richTextColor2),
            max: totalCount
        });

        let node1 = new cc.Node();
        node1.addComponent(cc.RichText);
        let rich = node1.getComponent(cc.RichText);
        // let richWidget = RichTextExtend.createWithContent(richText);
        rich.string = UIHelper.getRichTextContent(richText);
        rich.node.setAnchorPoint(cc.v2(0, 0.5));
        this._nodeProcess.addChild(rich.node);
        this._nodeProcess.active = (true);
    }
    _onGetRiotHelper(id, message) {
        if (message.ret != 1) {
            return;
        }
        this._updateListView();
    }
    _onGetRiotAward(id, message) {
        if (message.ret != 1) {
            return;
        }
        this._updateListView();
    }

}