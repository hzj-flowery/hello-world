const { ccclass, property } = cc._decorator;

import AttributeConst from '../../../const/AttributeConst';
import { AudioConst } from '../../../const/AudioConst';
import { HeroConst } from '../../../const/HeroConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import { HeroUnitData } from '../../../data/HeroUnitData';
import { Colors, G_AudioManager, G_EffectGfxMgr, G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';
import CommonListView from '../../../ui/component/CommonListView';
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop';
import PopupBase from '../../../ui/PopupBase';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { PrioritySignal } from '../../../utils/event/PrioritySignal';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import HeroKarmaCell from './HeroKarmaCell';


let RECORD_ATTR_LIST = [
    [
        AttributeConst.ATK,
        '_fileNodeAttr1'
    ],
    [
        AttributeConst.HP,
        '_fileNodeAttr3'
    ],
    [
        AttributeConst.PD,
        '_fileNodeAttr2'
    ],
    [
        AttributeConst.MD,
        '_fileNodeAttr4'
    ],
    [
        AttributeConst.CRIT,
        null
    ],
    [
        AttributeConst.NO_CRIT,
        null
    ],
    [
        AttributeConst.HIT,
        null
    ],
    [
        AttributeConst.NO_HIT,
        null
    ],
    [
        AttributeConst.HURT,
        null
    ],
    [
        AttributeConst.HURT_RED,
        null
    ]
];

@ccclass
export default class PopupHeroKarma extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _panelBg: CommonNormalLargePop = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonLeft: cc.Button = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _buttonRight: cc.ScrollView = null;
    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _commListView: CommonListView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroKarmaCell: cc.Node = null;

    private _heroUnitData: HeroUnitData;
    private _canClose: boolean;
    private _activeData: any;
    private _lastAttr: any;
    private _diffAttr: any;
    private _signalHeroKarmaActive: any;
    private _rangeType: number;
    private _allHeroIds: Array<number>;
    private _selectedPos: number;
    private _heroCount: number;
    private _karmaData: Array<any>;//下标从0走
    private _count: number;

    protected preloadResList = [{path:Path.getCommonPrefab("CommonHeroIcon"),type:cc.Prefab}]
    onLoad() {
        super.onLoad();
        this.node.name = "PopupHeroKarma";
    }

    public setInitData(heroUnitData, rangeType):void{
         this._heroUnitData = heroUnitData;
         this._rangeType = rangeType;
         if(this.signal==null)
         {
             this.signal = new PrioritySignal('string');
         }
    }

    onCreate() {
        this._activeData = null;
        this._canClose = true;
        this._lastAttr = {};
        this._diffAttr = {};
        this._panelBg.addCloseEventListener(handler(this, this._onButtonClose));
        // this._listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listView.setCustomCallback(handler(this, this._onItemTouch));

       
    }
    onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
    }
    onEnter() {
        this._signalHeroKarmaActive = G_SignalManager.add(SignalConst.EVENT_HERO_KARMA_ACTIVE_SUCCESS, handler(this, this._heroKarmaActiveSuccess));
        if (this._rangeType == HeroConst.HERO_RANGE_TYPE_1) {
            this._allHeroIds = G_UserData.getHero().getRangeDataBySort();
        } else if (this._rangeType == HeroConst.HERO_RANGE_TYPE_2) {
            this._allHeroIds = G_UserData.getTeam().getHeroIdsInBattle();
        }
        this._selectedPos = 1;
        let heroId = this._heroUnitData.getId();
        for (let i in this._allHeroIds) {
            let id = this._allHeroIds[i];
            if (id == heroId) {
                this._selectedPos = parseInt(i)+1;
            }
        }
        this._heroCount = this._allHeroIds.length;
        this._updateArrowBtn();

        let scrollViewParam = {
            template: this._heroKarmaCell,
        };
        this._commListView.init(scrollViewParam.template, handler(this, this._onItemUpdate), handler(this, this._onItemSelected),handler(this,this._onItemTouch));
        this._updateView();
    }
    onExit() {
        this._signalHeroKarmaActive.remove();
        this._signalHeroKarmaActive = null;
    }
    _updateView() {
        let heroBaseId = this._heroUnitData.getBase_id();
        let param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);

        if (this._heroUnitData.isLeader()) {
            this._panelBg.setTitle(Lang.get('hero_karma_title', { name: Lang.get('main_role') }));
        } else {
            this._panelBg.setTitle(Lang.get('hero_karma_title', { name: param.name }));
        }
        this._karmaData = [];
        let config = this._heroUnitData.getConfig();
        let karmaData = HeroDataHelper.getHeroKarmaData(config);
        for (let i = 0; i < HeroConst.HERO_KARMA_MAX; i++) {
            let data = karmaData[i];
            if (data) {
                let isReach = HeroDataHelper.getReachCond(this._heroUnitData, data['cond1'], data['cond2']);
                let isActive = this._heroUnitData.isUserHero() && G_UserData.getKarma().isActivated(data.id);
                if (isReach || isActive) {
                    this._karmaData.push(data);
                }
            }
        }
        this._count = Math.ceil(this._karmaData.length / 3);
        // this._listView.content.removeAllChildren();
        // this._listView.resize(this._count);
        this._commListView.setData(this._count);
        this._recordBaseAttr();
        G_UserData.getAttr().recordPower();
    }
    _onItemUpdate(item:HeroKarmaCell, index,type) {
        let startIndex = index * 3 + 0;
        let endIndex = startIndex + 2;
        let itemLine = [];
        if (this._karmaData.length > 0) {
            for (let i = startIndex; i <= endIndex && i < this._karmaData.length; i++) {
                let itemData = this._karmaData[i];
                itemLine.push(itemData);
            }
            if (itemLine.length <= 0) {
                itemLine = null;
            }
            item.updateItem(index, itemLine, type);
        }

    }
    _onItemSelected(itemId:number, index1:number) {
        itemId = itemId*3 + index1;
        let destinyId = this._karmaData[itemId-1].id;
        G_UserData.getKarma().c2sHeroActiveDestiny(this._heroUnitData.getBase_id(), destinyId, this._heroUnitData.getId());
    }
    doActive(id) {
        G_UserData.getKarma().c2sHeroActiveDestiny(this._heroUnitData.getBase_id(), id, this._heroUnitData.getId());
    }
    _onItemTouch(index, t) {
        index = index * 3 + t;
        let destinyId = this._karmaData[index].id;
        G_UserData.getKarma().c2sHeroActiveDestiny(this._heroUnitData.getBase_id(), destinyId, this._heroUnitData.getId());
    }
    _onButtonClose() {
        if (this._canClose) {
            this.close();
        }
    }
    _updateArrowBtn() {
        this._buttonLeft.node.active = (this._selectedPos > 1)?true:false;
        this._buttonRight.node.active = (this._selectedPos < this._heroCount)?true:false;
    }
    onButtonLeftClicked() {
        if (this._selectedPos <= 1) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        let curHeroId = this._allHeroIds[this._selectedPos-1];
        this._heroUnitData = G_UserData.getHero().getUnitDataWithId(curHeroId);
        this._updateArrowBtn();
        this._updateView();
    }
    onButtonRightClicked() {
        if (this._selectedPos >= this._heroCount) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        let curHeroId = this._allHeroIds[this._selectedPos-1];
        this._heroUnitData = G_UserData.getHero().getUnitDataWithId(curHeroId);
        this._updateArrowBtn();
        this._updateView();
    }
    _heroKarmaActiveSuccess(eventName, destinyId) {
        let config = this._heroUnitData.getConfig();
        this._karmaData = HeroDataHelper.getHeroKarmaData(config);
        let itemList:Array<cc.Node> = this._listView.content.children;
        for (let i in itemList) {
            let node = itemList[i];
            let cell = node.getComponent(HeroKarmaCell)  as HeroKarmaCell;
            if (cell.getKarmaId1() == destinyId) {
                let index = cell.itemID;
                let data1 = this._karmaData[index * 3 + 0];
                let data2 = this._karmaData[index * 3 + 1];
                let data3 = this._karmaData[index * 3 + 2];
                cell.updateData(data1, data2, data3);
                this._activeData = data1;
                this._recordBaseAttr();
                G_UserData.getAttr().recordPower();
                this._playEffect(destinyId);
                break;
            }
            if (cell.getKarmaId2() == destinyId) {
                let index = cell.itemID;
                let data1 = this._karmaData[index * 3 + 0];
                let data2 = this._karmaData[index * 3 + 1];
                let data3 = this._karmaData[index * 3 + 2];
                cell.updateData(data1, data2, data3);
                this._activeData = data2;
                this._recordBaseAttr();
                G_UserData.getAttr().recordPower();
                this._playEffect(destinyId);
                break;
            }
            if (cell.getKarmaId3() == destinyId) {
                let index = cell.itemID;
                let data1 = this._karmaData[index * 3 + 0];
                let data2 = this._karmaData[index * 3 + 1];
                let data3 = this._karmaData[index * 3 + 2];
                cell.updateData(data1, data2, data3);
                this._activeData = data3;
                this._recordBaseAttr();
                G_UserData.getAttr().recordPower();
                this._playEffect(destinyId);
                break;
            }
        }
    }
    _playEffect(destinyId) {
        let effectFunction = function (effect) {
            if (effect == 'heidi') {
                return  UIHelper.createLayerColor(cc.color(0, 0, 0, 255 * 0.8));
            }
            return this._createActionNode(effect);
        }.bind(this)
        let eventFunction = function (event) {
            if (event == 'piaozi') {
                this._playKarmaActiveSummary(destinyId);
            } else if (event == 'finish') {
                this._canClose = true;
                this.setShowFinish(true);
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP,"PopupHeroKarma");
            }
        }.bind(this)
        this._canClose = false;
        this.setShowFinish(false);
        let len = this._activeData.heroIds.length + 1;
        let effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_yuanfen_' + (len + 'p'), effectFunction, eventFunction, true);
        effect.node.setPosition(new cc.Vec2(0, 0));
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HERO_KARMA);
    }
    _createActionNode(effect: string) {
        let stc = effect.indexOf('moving_yuanfen_icon_')
        let edc = "moving_yuanfen_icon_".length + stc;
        if (stc >= 0) {
            let index = effect.substring(edc);
            let node = this._createIconNode(parseInt(index));
            return node;
        }
        return new cc.Node();
    }
    _createIconNode(index:number) {
        let effectFunction = function (effect):cc.Node {
            if (effect == 'icon_2') {
                let icon = (cc.instantiate(cc.resources.get(Path.getCommonPrefab("CommonHeroIcon"))) as cc.Node).getComponent(CommonHeroIcon);
                let heroId = this._heroUnitData.getBase_id();
                if (index > 1) {
                    heroId = this._activeData.heroIds[index - 2];
                }
                if (heroId) {
                    icon.updateUI(heroId);
                    this.scheduleOnce(()=>{
                        icon.node.scale = 0.8;
                    })
                    return icon.node;
                }
            }
            return new cc.Node();
        }.bind(this)
        let eventFunction = function (event) {
            if (event == 'finish') {
            }
        }
        let node = new cc.Node();
        let resName = 'moving_yuanfen_icon_' + index;
        let effect = G_EffectGfxMgr.createPlayMovingGfx(node, resName, effectFunction, eventFunction, false);
        return node;
    }
    _playKarmaActiveSummary(destinyId) {
        let summary = [];
        if (destinyId) {
            let heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, this._heroUnitData.getBase_id());
            let config = HeroDataHelper.getHeroFriendConfig(destinyId);
            let karmaName = config.friend_name;
            let content = Lang.get('summary_karma_active', {
                heroName: heroParam.name,
                colorHero: Colors.colorToNumber(heroParam.icon_color),
                outlineHero: Colors.colorToNumber(heroParam.icon_color_outline),
                karmaName: karmaName
            });
            let param = { content: content };
            summary.push(param);
        }
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary();
    }
    _addBaseAttrPromptSummary(summary: Array<any>) {
        for (let i in RECORD_ATTR_LIST) {
            let one = RECORD_ATTR_LIST[i];
            let attrId = one[0];
            let dstNodeName = one[1];
            let diffValue = this._diffAttr[attrId];
            if (diffValue != 0) {
                let param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: new cc.Vec2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_ATTR }
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _recordBaseAttr() {
        let param = { heroUnitData: this._heroUnitData };
        let attrInfo = HeroDataHelper.getTotalAttr(param);
        let diffAttr = {};
        for (let i in RECORD_ATTR_LIST) {
            let one = RECORD_ATTR_LIST[i];
            let id = one[0];
            let lastValue = this._lastAttr[id] || 0;
            let curValue = attrInfo[id] || 0;
            let diffValue = curValue - lastValue;
            diffAttr[id] = diffValue;
        }
        this._diffAttr = diffAttr;
        this._lastAttr = attrInfo;
    }

}