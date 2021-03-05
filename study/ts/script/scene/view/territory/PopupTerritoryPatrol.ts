const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { SignalConst } from '../../../const/SignalConst';
import { TerritoryConst } from '../../../const/TerritoryConst';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors, G_ConfigLoader, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonDetailTitle from '../../../ui/component/CommonDetailTitle';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem';
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop';
import PopupBoxReward from '../../../ui/popup/PopupBoxReward';
import PopupChooseHeroHelper from '../../../ui/popup/PopupChooseHeroHelper';
import PopupAlert from '../../../ui/PopupAlert';
import PopupBase from '../../../ui/PopupBase';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { Util } from '../../../utils/Util';
import { TerritoryHelper } from './TerritoryHelper';





@ccclass
export default class PopupTerritoryPatrol extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _imageLeftHero: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCityName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroTopDesc: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHeroBottom: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHeroBottomDesc: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroBottom: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAdd: cc.Sprite = null;

    @property({
        type: CommonDetailTitle,
        visible: true
    })
    _textReward: CommonDetailTitle = null;

    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _scrollReward: CommonListViewLineItem = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _imageRightDetail: cc.Node = null;

    @property({
        type: CommonDetailTitle,
        visible: true
    })
    _textCityDescName: CommonDetailTitle = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCityDesc: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _imageRightLog: cc.Node = null;

    @property({
        type: CommonDetailTitle,
        visible: true
    })
    _textPartolTitle: CommonDetailTitle = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listViewLog: cc.ScrollView = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonAvatar: CommonHeroAvatar = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonNpcAvatar1: CommonHeroAvatar = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonNpcAvatar2: CommonHeroAvatar = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonNpcAvatar3: CommonHeroAvatar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeNormal: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textStateDes: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPowerDesc: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPower: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRoitTime: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnCommonClick: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePatrol: cc.Node = null;

    @property({
        type: CommonDetailTitle,
        visible: true
    })
    _textSelectPatrolTypeTitle: CommonDetailTitle = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _checkBoxText1: cc.Label = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox1: cc.Toggle = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _costResTxt1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _costResNum1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgRes1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _checkBoxText3: cc.Label = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox3: cc.Toggle = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgRes3: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _costResNum3: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _costResTxt3: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _checkBoxText2: cc.Label = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox2: cc.Toggle = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _costResTxt2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _costResNum2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgRes2: cc.Sprite = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnPatrolClick: CommonButtonLevel0Highlight = null;

    public static MAX_BUBBLE_WIDTH = 200;

    _imageBeginPatrolBottom: any;
    _dropItemList: any[];
    _textList: any[];
    _timeList: any[];
    _stateFunc = {};

    _eventList: any[];
    _signalPatrolAward: any;
    _signalRiotHelper: any;
    _signalPatrol: any;
    _signalTerritoryUpdate: any;
    _signalTerritoryClickHero: any;
    _checkIndex: any;
    _cityState: any;
    _cityId: any;
    _cityData: any;
    _chooseHeroId: any;
    _itemParams: any;
    _nextRewardTime: any;
    _imageLock: any;
    _itemTrans: any[];



    ctor() {
        this._imageBeginPatrolBottom = null;
        this._dropItemList = [];
        this._textList = [];
        this._timeList = [];
        this._eventList = [];
        this.node.name = ('PopupTerritoryPatrol');
        this._commonAvatar.init();
        this._commonNpcAvatar1.init();
        this._commonNpcAvatar2.init();
        this._commonNpcAvatar3.init();
    }
    onCreate() {
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._btnCommonClick.addClickEventListenerEx(handler(this, this._onCommonBtnClick));
        this._btnPatrolClick.addClickEventListenerEx(handler(this, this._onClickPatrol));
        // this._imageLeftHero.setTouchEnabled(true);
        // this._imageLeftHero.addTouchEventListener(function (sender, eventType) {
        //     if (eventType == ccui.TouchEventType.ended) {
        //         this._onClickLeftImage(sender);
        //     }
        // });
        this._textReward.setFontSize(24);
        this._textReward.setTitleColor(TerritoryConst.TITLE_COLOR);
        this._textCityDescName.setFontSize(24);
        this._textCityDescName.setTitleColor(TerritoryConst.TITLE_COLOR);
        this._textSelectPatrolTypeTitle.setFontSize(24);
        this._textPartolTitle.setFontSize(24);
        this._textCityDesc.lineHeight = 24;
        this._scrollReward.setItemSpacing(5);
        this._stateFunc = {
            [TerritoryConst.STATE_NONE]: handler(this, this._stateNone),
            [TerritoryConst.STATE_LOCK]: handler(this, this._stateLock),
            [TerritoryConst.STATE_FIGHT]: handler(this, this._stateFight),
            [TerritoryConst.STATE_ADD]: handler(this, this._stateAdd),
            [TerritoryConst.STATE_COUNTDOWN]: handler(this, this._stateCountDown),
            [TerritoryConst.STATE_RIOT]: handler(this, this._stateRiot),
            [TerritoryConst.STATE_FINISH]: handler(this, this._stateFinish)
        };
        this.setClickOtherClose(true);
    }
    onCheckBox1() {
        this._updatePatrolInfo(1);
    }
    onCheckBox2() {
        this._updatePatrolInfo(2);
    }
    onCheckBox3() {
        this._updatePatrolInfo(3);
    }
    _getPatrolCheckIndex() {
        for (var i = 1; i <= 3; i++) {
            var isCheck = this['_checkBox' + i].isChecked;
            if (isCheck == true) {
                return i;
            }
        }
        return 1;
    }
    _updatePatrolInfo(checkIndex) {
        if (this['_checkBox' + checkIndex].isChecked == false) {
            return;
        }
        for (var i = 1; i <= 3; i++) {
            this['_checkBoxText' + i].node.color = (Colors.BRIGHT_BG_TWO);
            this['_costResTxt' + i].node.color = (Colors.BRIGHT_BG_TWO);
            this['_costResNum' + i].node.color = (Colors.BRIGHT_BG_TWO);
        }
        this['_checkBoxText' + checkIndex].node.color = (Colors.SYSTEM_TARGET);
        this['_costResTxt' + checkIndex].node.color = (Colors.SYSTEM_TARGET);
        this['_costResNum' + checkIndex].node.color = (Colors.SYSTEM_TARGET);
        if (checkIndex == 1) {
            if (this._checkBox1.isChecked) {
                this._checkBox2.uncheck();
                this._checkBox3.uncheck();
                this._checkBox1.interactable = false;
                this._checkBox2.interactable = true;
                this._checkBox3.interactable = true;
            }
        }
        else if (checkIndex == 2) {
            if (this._checkBox2.isChecked) {
                this._checkBox1.uncheck();
                this._checkBox3.uncheck();
                this._checkBox1.interactable = true;
                this._checkBox2.interactable = false;
                this._checkBox3.interactable = true;
            }
        }
        else if (checkIndex == 3) {
            if (this._checkBox3.isChecked) {
                this._checkBox2.uncheck();
                this._checkBox1.uncheck();
                this._checkBox1.interactable = true;
                this._checkBox2.interactable = true;
                this._checkBox3.interactable = false;
            }
        }
    }
    onBtnCancel() {
        this.close();
    }
    onEnter() {
        this._signalPatrolAward = G_SignalManager.add(SignalConst.EVENT_TERRITORY_GETAWARD, handler(this, this._onEventPartolAward));
        this._signalRiotHelper = G_SignalManager.add(SignalConst.EVENT_TERRITORY_FORHELP, handler(this, this._onEventRiotHelper));
        this._signalPatrol = G_SignalManager.add(SignalConst.EVENT_TERRITORY_PATROL, handler(this, this._onEventPatrol));
        this._signalTerritoryUpdate = G_SignalManager.add(SignalConst.EVENT_TERRITORY_UPDATEUI, handler(this, this._onEventTerritoryUpdate));
        this._signalTerritoryClickHero = G_SignalManager.add(SignalConst.EVENT_TERRITORY_CLICK_HERO, handler(this, this._onEventTerritoryClickHero));
    }
    onExit() {
        this._signalPatrolAward.remove();
        this._signalPatrolAward = null;
        this._signalRiotHelper.remove();
        this._signalRiotHelper = null;
        this._signalPatrol.remove();
        this._signalPatrol = null;
        this._signalTerritoryUpdate.remove();
        this._signalTerritoryUpdate = null;
        this._signalTerritoryClickHero.remove();
        this._signalTerritoryClickHero = null;
        this._stopCountDown();
    }
    _onEventTerritoryUpdate(id, message) {
        //logWarn('PopupTerritoryPatrol:_onEventTerritoryUpdate');
        this.updateUI(this._cityId);
    }
    setStatus(status) {
        this._cityState = status;
        // this.clear();
        // this.updateNode();
    }
    updateUI(index) {
        //dump(index);
        this._cityId = index;
        this.reset();
        if (this._stateFunc[this._cityState] != null) {
            this._stateFunc[this._cityState]();
        }
        this._updateEvents();
        this._updateNextRewardTime();
    }
    _setNodeVisible(visible, ...nodeList: any[]) {
        for (var i in nodeList) {
            var node = nodeList[i];
            if (node) {
                if (node instanceof cc.Node) {
                    node.active = (visible);
                }
                else {
                    node.node.active = visible;
                }
            }
        }
    }
    _updateCountDown(dt) {
        var remainTime = this._cityData.endTime;
        var timeString = '00:00:00';
        if (remainTime > 0) {
            timeString = G_ServerTime.getLeftSecondsString(remainTime);
        }
        this._nodeHeroBottomDesc.active = (false);
        this._textHeroBottom.node.active = (true);
        this._textHeroBottom.string = (Lang.get('lang_territory_countDown_ex'));

        this._nodeHeroBottom.getChildByName('Text_countDown').active = true;
        this._nodeHeroBottom.getChildByName('Text_countDown').getComponent(cc.Label).string = timeString;
        this._updateNextRewardTime();
        if (this._cityState == TerritoryConst.STATE_RIOT) {
            var riotId = G_UserData.getTerritory().getFirstRiotId(this._cityId), riotEvent;
            if (riotEvent) {
                var riotNeedTime = parseInt(TerritoryHelper.getTerritoryParameter('riot_continue_time'));
                var riotEndTime = riotEvent.time + riotNeedTime;
                var riotString = G_ServerTime.getLeftSecondsString(riotEndTime);
                var pendingStr = Lang.get('lang_territory_riot');
                this._nodeRoitTime.active = (true);
                this._nodeRoitTime.getChildByName('Text_RoitTime').getComponent(cc.Label).string = riotString;
            }
        } else {
            this._textStateDes.node.active = (false);
            if (TerritoryHelper.isRoitState(this._cityId) == true && this._cityState == TerritoryConst.STATE_COUNTDOWN) {
                G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_UPDATEUI, null);
                return;
            }
        }
        if (remainTime < G_ServerTime.getTime()) {
            G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_UPDATEUI, null);
            return;
        }
    }
    _startCountDown() {
        this.schedule(this._updateCountDown, 0.5);
        this._updateCountDown(0);

    }
    _stopCountDown() {
        this.unschedule(this._updateCountDown);

    }
    _onCommonBtnClick(sender) {
        if (this._cityState == TerritoryConst.STATE_FIGHT) {
            G_UserData.getTerritory().c2sAttackTerritory(this._cityId);
            this.close();
        }
        if (this._cityState == TerritoryConst.STATE_FINISH) {
            G_UserData.getTerritory().c2sGetPatrolAward(this._cityId);
        }
        if (this._cityState == TerritoryConst.STATE_COUNTDOWN) {
            var onClickConfirm = function () {
                G_UserData.getTerritory().c2sGetPatrolAward(this._cityId);
            }.bind(this);
            if (this._dropItemList.length == 0) {
                var popup: PopupAlert = Util.getNode('prefab/common/PopupAlert', PopupAlert);
                popup.init(Lang.get('common_title_notice'), Lang.get('lang_territory_not_award'), onClickConfirm);
                popup.openWithAction();
            } else {
                var popup1: PopupBoxReward = Util.getNode('prefab/common/PopupBoxReward', PopupBoxReward);
                popup1.init(Lang.get('lang_territory_pre_get_patrol'), onClickConfirm);
                popup1.updateUI(this._dropItemList);
                popup1.openWithAction();
                popup1.setDetailText(Lang.get('lang_territory_cancel_patrol'));
            }
        }
        if (this._cityState == TerritoryConst.STATE_RIOT) {
            //dump(this._cityId);
            var isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild == false) {
                G_Prompt.showTip(Lang.get('auction_no_guild'));
                return;
            }
            var riotId = G_UserData.getTerritory().getFirstRiotId(this._cityId);
            if (riotId > 0) {
                G_UserData.getTerritory().c2sTerritoryForHelp(this._cityId, riotId);
            }
        }
    }
    _onClickPatrol(sender) {
        if (this._chooseHeroId == null || this._chooseHeroId == 0) {
            G_Prompt.showTip(Lang.get('lang_territory_choose_hero_error'));
            return;
        }
        var checkIndex = this._getPatrolCheckIndex();
        var [typeItem, needTime] = TerritoryHelper.getTerritoryPatrolCost('patrol_choice_time' + checkIndex);
        if (LogicCheckHelper.enoughValue(typeItem.type, typeItem.value, typeItem.size) == false) {
            return;
        }
        var callBackFunction = function () {
            G_UserData.getTerritory().c2sPatrolTerritory(this._cityId, checkIndex, this._chooseHeroId);
        }.bind(this)
        if (this._cityState == TerritoryConst.STATE_ADD) {
            if (this._chooseHeroId && this._chooseHeroId > 0) {
                var itemCost = typeItem.name + ('X' + typeItem.size);
                var hour = needTime / 3600;
                var buyTimesAlert = Lang.get('lang_territory_partol_alert', {
                    itemCost: itemCost,
                    color1: Colors.colorToNumber(typeItem.icon_color),
                    time: hour
                });
                G_SceneManager.openPopup("prefab/common/PopupSystemAlert", (popup: PopupSystemAlert) => {
                    popup.setup(Lang.get('arena_buytimes_notice'), buyTimesAlert, callBackFunction);
                    popup.openWithAction();
                    popup.setCheckBoxVisible(false);
                    popup.setClickOtherClose(true);
                });
            }
        }
    }
    onClickLeftImage(sender) {
        if (this._cityState == TerritoryConst.STATE_ADD) {
            if (this._btnPatrolClick.isEnabled() == false) {
                return;
            }
            var onClickChooseHero = function (heroId) {
                G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_CLICK_HERO, heroId);
            }.bind(this);
            UIPopupHelper.popupChooseHero(PopupChooseHeroHelper.FROM_TYPE5, handler(this, onClickChooseHero), null, Lang.get('lang_territory_choose_hero_title'))
        }
    }
    _updateNpcAvatar() {
        this._commonNpcAvatar1.node.active = (false);
        this._commonNpcAvatar2.node.active = (false);
        var config = this._cityData.cfg;
        var str = (config.npc_value.split('|'));
        var npc1 = str[0];
        var npc2 = str[1];
        this._commonNpcAvatar1.updateUI(parseInt(npc1));
        this._commonNpcAvatar2.updateUI(parseInt(npc2));
        if (this._cityState == TerritoryConst.STATE_COUNTDOWN) {
            this._commonNpcAvatar1.showLoopBubble(config.npc1_emote_value, null);
            var delayFunc = function () {
                this._commonNpcAvatar2.showLoopBubble(config.npc2_emote_value, null);
            }.bind(this);
            var delay = cc.delayTime(2);
            var sequence = cc.sequence(delay, cc.callFunc(delayFunc));
            this._commonNpcAvatar2.node.runAction(sequence);
        }
        if (this._cityState == TerritoryConst.STATE_RIOT) {
            this._commonNpcAvatar1.showLoopBubble(config.npc1_riot_bubble, null);
            var delayFunc = function () {
                this._commonNpcAvatar2.showLoopBubble(config.npc2_riot_bubble, null);
            }.bind(this)
            var delay = cc.delayTime(2);
            var sequence = cc.sequence(delay, cc.callFunc(delayFunc));
            this._commonNpcAvatar2.node.runAction(sequence);
        }
    }
    _updateHeroAvatar(heroBaseId, limitLevel, limitRedLevel) {
        this._commonNpcAvatar3.node.active = (false);
        this._imageAdd.node.active = (false);
        var territoryCfg = this._cityData.cfg;
        var updateCommonHeroAvatar = function (heroBaseId, talkMsg) {
            this._commonAvatar.node.active = (true);
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, null, null, limitLevel, limitRedLevel);
            this._commonAvatar.updateUI(heroBaseId, null, null, limitLevel, null, null, limitRedLevel);
            this._commonAvatar.updateHeroName(heroParam.name, heroParam.color, true);
            this._commonAvatar.setBubble(talkMsg, null, 2, true, PopupTerritoryPatrol.MAX_BUBBLE_WIDTH);
        }.bind(this);
        if (this._cityState == TerritoryConst.STATE_COUNTDOWN || this._cityState == TerritoryConst.STATE_RIOT) {
            this._commonAvatar.node.active = (false);
            this._commonNpcAvatar3.node.active = (true);
            this._commonNpcAvatar3.updateUI(heroBaseId, null, null, limitLevel, null, null, limitRedLevel);
            var moveHeroPosX = this._commonNpcAvatar3.node.getPosition().x;
            var moveHeroPosY = this._commonNpcAvatar3.node.getPosition().y;
            var action3 = cc.moveTo(2.5, cc.v2(moveHeroPosX - 150, moveHeroPosY));
            var action2 = cc.callFunc(function () {
                this._commonNpcAvatar3.turnBack(true);
            }.bind(this));
            var action4 = cc.callFunc(function () {
                this._commonNpcAvatar3.turnBack(false);
            }.bind(this));
            var action1 = cc.moveTo(2.5, cc.v2(moveHeroPosX + 150, moveHeroPosY));
            var seq = cc.sequence(action1, action2, action3, action4);
            var re = cc.repeatForever(seq);
            this._commonNpcAvatar3.node.runAction(re);
            this._commonNpcAvatar3.setAction('run', true);
        }
        if (this._cityState == TerritoryConst.STATE_FINISH) {
            var talkMsg = TerritoryHelper.getBubbleContentById(territoryCfg.patrol_over_bubble);
            updateCommonHeroAvatar(heroBaseId, talkMsg);
        }
        if (this._cityState == TerritoryConst.STATE_ADD) {
            var talkMsg = TerritoryHelper.getBubbleContentById(territoryCfg.patrol_hero_bubble);
            updateCommonHeroAvatar(heroBaseId, talkMsg);
        }
    }
    _onEventTerritoryClickHero(eventName, heroId) {
        if (heroId && heroId > 0) {
            this._nodeHeroBottomDesc.removeAllChildren();
            var heroUnit = G_UserData.getHero().getUnitDataWithId(heroId);
            var heroBaseId = heroUnit.getBase_id();
            var limitLevel = heroUnit.getLimit_level();
            var limitRedLevel = heroUnit.getLimit_rtg();
            var config = heroUnit.getConfig();
            this._updateHeroAvatar(heroBaseId, limitLevel, limitRedLevel);
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, null, null, limitLevel, limitRedLevel);
            this._chooseHeroId = heroId;
            var richText = Lang.get('lang_territory_patrol_hero_desc', {
                heroName: param.name,
                heroColor: Colors.colorToHexStr(Colors.getColor(param.color)),
                heroFragColor: Colors.colorToHexStr(Colors.getColor(config.color))
            });

            // var widget = RichTextExtend.createWithContent(richText);
            let richNode = new cc.Node();
            let rich = richNode.addComponent(cc.RichText);
            rich.string = UIHelper.getRichTextContent(richText);
            this._nodeHeroBottomDesc.addChild(richNode);
            // this._nodeHeroBottomDesc.active = true;
            this._textHeroBottom.node.active = (false);
            this._imageRightDetail.active = (false);
            this._nodePatrol.active = (true);
            this._updatePatrolChoose();

            this._updateEvents();
            var newDrop = this._dropItemList;
            newDrop.unshift({
                type: TypeConvertHelper.TYPE_FRAGMENT,
                value: config.fragment_id,
                size: 1
            });
            this._scrollReward.updateUI(newDrop);
        }
    }
    _updatePatrolChoose() {
        for (var i = 1; i <= 3; i++) {
            var typeItem = TerritoryHelper.getTerritoryPatrolCost('patrol_choice_time' + i)[0];
            this['_checkBoxText' + i].node.color = (Colors.BRIGHT_BG_ONE);
            this['_costResTxt' + i].node.color = (Colors.BRIGHT_BG_ONE);
            this['_costResNum' + i].node.color = (Colors.BRIGHT_BG_ONE);
            this['_checkBoxText' + i].string = (Lang.get('lang_territory_patrol_' + i));
            this['_costResNum' + i].string = (typeItem.size);
            var itemParams = TypeConvertHelper.convert(typeItem.type, typeItem.value);
            this._itemParams = itemParams;
            if (itemParams.res_mini) {
                UIHelper.loadTexture(this['_imgRes' + i], itemParams.res_mini);
            }
        }
        this._checkIndex = 1;
        this._textSelectPatrolTypeTitle.setTitleAndAdjustBgSize(Lang.get('lang_territory_select_patrol_time_title'));
        this._textSelectPatrolTypeTitle.setTitleColor(TerritoryConst.TITLE_COLOR);
        this._updatePatrolInfo(this._checkIndex);
    }
    reset() {
        this._stopCountDown();
        if (this._cityId && this._cityId > 0) {
            this._cityData = TerritoryHelper.getTerritoryData(this._cityId);
        }
        this._cityState = this._cityData.state;
        this._stateNone();
    }
    _stateNone() {
        //logWarn('PopupTerritoryPatrol:_stateNone');
        this._commonNodeBk.setTitle(Lang.get('lang_territory_patrol_title'));
        this._textCityName.string = (TextHelper.expandTextByLen(this._cityData.cfg.name, 3));
        this._textCityDesc.string = (this._cityData.cfg.directions);
        this._textStateDes.node.active = (false);
        // this._nodeHeroBottom.updateLabel('Text_countDown', { visible: false });
        this._nodeHeroBottom.getChildByName("Text_countDown").active = false;
        this._nextRewardTime = null;
        this._commonAvatar.node.stopAllActions();
        // this._commonNpcAvatar3.node.setPosition(cc.v2(340, 200));
        this._commonNpcAvatar3.node.stopAllActions();
    }
    _stateLock() {
        //logWarn('PopupTerritoryPatrol:_stateLock');
        this._commonNodeBk.setTitle(Lang.get('lang_territory_patrol_title'));
    }
    _stateFight() {
        //logWarn('PopupTerritoryPatrol:_stateFight');
        this._commonNodeBk.setTitle(Lang.get('lang_territory_title'));
        this._setNodeVisible(true, this._textPower, this._textPowerDesc, this._nodeNormal, this._commonAvatar, this._textCityName, this._imageRightDetail);
        this._setNodeVisible(false, this._nodeRoitTime, this._commonNpcAvatar1, this._commonNpcAvatar2, this._textHeroTopDesc, this._imageLock, this._imageAdd, this._imageRightLog, this._nodeHeroBottom, this._nodePatrol);
        var fightStr = Lang.get('lang_territory_tower_recommand_bp', { count: TextHelper.getAmountText(this._cityData.cfg.fight_value) });
        this._textPower.string = (fightStr);
        var power = G_UserData.getBase().getPower();
        if (power >= this._cityData.cfg.fight_value) {
            this._textPower.node.color = (Colors.BRIGHT_BG_GREEN);
        } else {
            this._textPower.node.color = (Colors.BRIGHT_BG_RED);
        }
        this._btnCommonClick.setString(Lang.get('lang_territory_fight'));
        var fightCfg = this._cityData.cfg;
        this._commonAvatar.node.active = (true);
        this._commonAvatar.updateUI(fightCfg.hero_id);
        this._commonAvatar.showVName(true);
        this._commonAvatar.updateHeroName(fightCfg.hero_name, fightCfg.hero_quality, true);
        var talkMsg = TerritoryHelper.getBubbleContentById(fightCfg.hero_bubble_id);
        this._commonAvatar.setBubble(talkMsg, null, 2, true, PopupTerritoryPatrol.MAX_BUBBLE_WIDTH);
        this._textCityDescName.setTitleAndAdjustBgSize(Lang.get('lang_territory_city_title'));
        this._textCityDesc.string = (this._cityData.cfg.directions);
        this._textReward.setTitleAndAdjustBgSize(Lang.get('lang_territory_battle_reward'));
    }
    _stateAdd() {
        //logWarn('PopupTerritoryPatrol:_stateAdd');
        this._commonNodeBk.setTitle(Lang.get('lang_territory_patrol_title'));
        this._btnPatrolClick.setEnabled(true);
        this._setNodeVisible(true, this._imageAdd, this._nodeHeroBottom, this._imageRightDetail);
        this._setNodeVisible(false, this._nodeRoitTime, this._nodePatrol, this._commonNpcAvatar1, this._commonNpcAvatar2, this._textHeroTopDesc, this._textPower, this._textPowerDesc, this._commonAvatar, this._nodeNormal, this._imageLock, this._imageRightLog);
        this._textHeroBottom.string = (Lang.get('lang_territory_patrol_desc'));
        this._textReward.setTitleAndAdjustBgSize(Lang.get('lang_territory_patrol_reward'));
        this._btnPatrolClick.setString(Lang.get('lang_territory_patrol'));
        this._textCityDescName.setTitleAndAdjustBgSize(Lang.get('lang_territory_city_title'));
        this._textCityDesc.string = (this._cityData.cfg.directions);
    }
    _stateCountDown() {
        //logWarn('PopupTerritoryPatrol:_stateCountDown');
        this._commonNodeBk.setTitle(Lang.get('lang_territory_patrol_title'));
        this._startCountDown();
        var baseId = this._cityData.heroId;
        if (baseId && baseId > 0) {
            var limitLevel = this._cityData.limitLevel;
            var limitRedLevel = this._cityData.limitRedLevel;
            this._updateHeroAvatar(baseId, limitLevel, limitRedLevel);
            this._updateNpcAvatar();
        }
        this._textReward.setTitleAndAdjustBgSize(Lang.get('lang_territory_curr_patrol_get_reward'));
        this._textPartolTitle.setTitle(Lang.get('lang_territory_partol_detail'));
        this._textPartolTitle.setTitleColor(TerritoryConst.TITLE_COLOR);
        this._btnCommonClick.setString(Lang.get('lang_territory_btn_pre_finish'));
        this._textReward.setTitleAndAdjustBgSize(Lang.get('lang_territory_curr_patrol_get_reward'));
        this._setNodeVisible(true, this._nodeNormal, this._commonNpcAvatar3, this._textCityName, this._nodeHeroBottom, this._imageRightLog);
        this._setNodeVisible(false, this._nodeRoitTime, this._commonAvatar, this._textHeroTopDesc, this._textPower, this._textPowerDesc, this._imageLock, this._imageAdd, this._imageRightDetail, this._nodePatrol);
    }
    _stateRiot() {
        //logWarn('PopupTerritoryPatrol:_stateRiot');
        this._commonNodeBk.setTitle(Lang.get('lang_territory_patrol_title'));
        this._startCountDown();
        this._setNodeVisible(true, this._textHeroTopDesc, this._nodeNormal, this._commonNpcAvatar3, this._textCityName, this._nodeHeroBottom, this._imageRightLog);
        this._setNodeVisible(false, this._textPower, this._textPowerDesc, this._nodeRoitTime, this._commonAvatar, this._imageLock, this._imageAdd, this._imageRightDetail, this._nodePatrol);
        this._btnCommonClick.setString(Lang.get('lang_territory_riot_help'));
        this._textReward.setTitleAndAdjustBgSize(Lang.get('lang_territory_curr_patrol_get_reward'));
        this._textPartolTitle.setTitle(Lang.get('lang_territory_partol_detail'));
        this._textPartolTitle.setTitleColor(TerritoryConst.TITLE_COLOR);
        var baseId = this._cityData.heroId;
        if (baseId && baseId > 0) {
            var limitLevel = this._cityData.limitLevel;
            var limitRedLevel = this._cityData.limitRedLevel;
            this._updateHeroAvatar(baseId, limitLevel, limitRedLevel);
            this._updateNpcAvatar();
        }
        var [riotId, riotEvent] = G_UserData.getTerritory().getFirstRiotId(this._cityId);
        if (riotId > 0) {
            if (riotEvent && riotEvent.for_help == true) {
                this._btnCommonClick.setString(Lang.get('lang_territory_riot_help'));
                this._btnCommonClick.setEnabled(false);
            } else {
                this._btnCommonClick.setEnabled(true);
            }
            var riotInfo = G_UserData.getTerritory().getTerritoryRiotInfo(this._cityId)[0];
            if (riotInfo) {
                this._textHeroTopDesc.string = (Lang.get('lang_territory_riot_title_top', { riotName: riotInfo.riot_name }));
                this._textHeroTopDesc.node.color = (Colors.getColor(riotInfo.riot_color));
            }
        }
    }
    _stateFinish() {
        //logWarn('PopupTerritoryPatrol:_stateFinish');
        this._commonNodeBk.setTitle(Lang.get('lang_territory_patrol_title'));
        this._setNodeVisible(true, this._nodeNormal, this._commonAvatar, this._textCityName, this._imageRightLog);
        this._setNodeVisible(false, this._nodeRoitTime, this._commonNpcAvatar1, this._commonNpcAvatar3, this._commonNpcAvatar2, this._textPower, this._textPowerDesc, this._textHeroTopDesc, this._imageLock, this._imageAdd, this._imageRightDetail, this._nodeHeroBottom, this._nodePatrol);
        this._btnCommonClick.setString(Lang.get('lang_territory_btn_finish'));
        var baseId = this._cityData.heroId;
        if (baseId && baseId > 0) {
            var limitLevel = this._cityData.limitLevel;
            var limitRedLevel = this._cityData.limitRedLevel;
            this._updateHeroAvatar(baseId, limitLevel, limitRedLevel);
        }
        this._textReward.setTitleAndAdjustBgSize(Lang.get('lang_territory_curr_patrol_get_reward'));
        this._textPartolTitle.setTitle(Lang.get('lang_territory_partol_detail'));
        this._textPartolTitle.setTitleColor(TerritoryConst.TITLE_COLOR);
        this._textStateDes.node.active = (true);
        this._textStateDes.string = (Lang.get('lang_territory_patrol_desc_finish'));
        this._textStateDes.node.color = (Colors.getColor(2));
    }
    _updateEvents() {
        var events = G_UserData.getTerritory().getTerritoryEventsTillNow(this._cityId);
        this._nextRewardTime = null;
        this._listViewLog.content.removeAllChildren();
        this._listViewLog.content.height = 0;
        var itemList = [];
        var getEventList = function () {
            var totalCount = events.length;
            var eventList = [];
            var eventInfoList = [];
            var isRoit = false;
            var procPartol = function (event) {
                var eventInfo = G_ConfigLoader.getConfig(ConfigNameConst.TERRITORY_EVENT).get(event.info_id);
                // assert(eventInfo, 'eventInfo is nil with Id ' + event.info_id);
                var awards = event.awards || {};
                if (awards.length > 0) {
                    for (var i in awards) {
                        var value = awards[i];
                        var key = value.type + ('_' + value.value);
                        if (itemList[key] == null) {
                            itemList[key] = 0;
                        }
                        itemList[key] = itemList[key] + value.size;
                    }
                }
                eventList.push(event);
                eventInfoList.push(eventInfo);
            }.bind(this);
            var procRiot = function (event) {
                if (event.event_type == TerritoryConst.RIOT_TYPE_OVER) {
                    if (event.is_repress == false) {
                        return;
                    }
                }
                var riotInfo = G_ConfigLoader.getConfig(ConfigNameConst.TERRITORY_RIOT).get(event.info_id);
                // assert(riotInfo, 'eventInfo is nil with Id' + event.info_id);
                eventList.push(event);
                eventInfoList.push(riotInfo);
            }.bind(this);
            function procNextTime() {
            }
            for (var i = totalCount - 1; i >= 0; i += -1) {
                var event = events[i];
                if (event != null) {
                    var update = true;
                    var isRoit = false;
                    if (event.event_type == TerritoryConst.RIOT_TYPE_OPEN || event.event_type == TerritoryConst.RIOT_TYPE_OVER) {
                        isRoit = true;
                    }
                    if (isRoit) {
                        procRiot(event);
                    } else {
                        procPartol(event);
                    }
                }
            }
            return [
                eventList,
                eventInfoList
            ];
        }.bind(this);
        var getDropItemList = function () {
            var itemTrans = [];
            if (this._cityState == TerritoryConst.STATE_FIGHT) {
                for (var i = 1; i <= 3; i++) {
                    var type = this._cityData.cfg['clearance_reward_type' + i];
                    if (type > 0) {
                        var value = this._cityData.cfg['clearance_reward_value' + i];
                        var size = this._cityData.cfg['clearance_reward_size' + i];
                        var itemStr = type + ('_' + (value + ('_' + size)));
                        itemTrans.push(itemStr);
                    }
                }
            }
            if (this._cityState == TerritoryConst.STATE_ADD) {
                for (var i = 1; i < 5; i++) {
                    var type = this._cityData.cfg['drop_type' + i];
                    if (type > 0) {
                        var value = this._cityData.cfg['drop_value' + i];
                        var size: any = 0;
                        var itemStr = type + ('_' + (value + ('_' + size)));
                        itemTrans.push(itemStr);
                    }
                }
            }
            for (var k in itemList) {
                var v = itemList[k];
                itemTrans.push(k + ('_' + v));
            }
            return itemTrans;
        }.bind(this);
        var [eventList, eventInfoList] = getEventList();
        var itemTrans = getDropItemList();
        this._itemTrans = itemTrans;
        this._updateItems(itemTrans);
        // this._updateEventLable(eventList || [], eventInfoList || []);

        this._createNextReawrdTime();
        // this._listViewLog.doLayout();
        this._listViewLog.scrollToBottom();
    }
    _updateItems(itemList) {
        this._dropItemList = [];
        this._scrollReward.setListViewSize(360, 90);
        this._scrollReward.setMaxItemSize(4);
        for (var i in itemList) {
            var item = itemList[i];
            var itemInfo = item.split('_');
            var type = parseInt(itemInfo[0]);
            var value = parseInt(itemInfo[1]);
            var size = parseInt(itemInfo[2]);
            var award = {
                type: type,
                value: value,
                size: size
            };
            this._dropItemList.push(award);
        }
        this._scrollReward.updateUI(this._dropItemList);
    }
    _createNextReawrdTime() {
        if (this._nextRewardTime == null) {
            var params1 = {
                name: 'label1',
                text: Lang.get('lang_territory_next_time_reward_desc'),
                fontSize: 20,
                color: Colors.NORMAL_BG_ONE
            };
            var params2 = {
                name: 'label2',
                text: '[0:0:0]',
                fontSize: 20,
                color: Colors.BRIGHT_BG_ONE
            };
            var widget = UIHelper.createTwoLabel(params1, params2);
            var size = widget.getContentSize();
            widget.setContentSize(cc.size(size.width, size.height + 6));
            widget.active = (false);
            this._listViewLog.content.addChild(widget);
            widget.anchorX = 0;
            widget.anchorY = 0;
            widget.x = 0;
            widget.y = -widget.height - 6 - this._listViewLog.content.height;
            this._listViewLog.content.height += widget.height + 6;
            this._nextRewardTime = widget;
        }
        if (this._cityState == TerritoryConst.STATE_FINISH) {
            var params1 = {
                name: 'label1',
                text: Lang.get('lang_territory_patrol_finish_desc'),
                fontSize: 20,
                color: Colors.BRIGHT_BG_ONE
            };
            var widget = UIHelper.createLabel(params1);
            widget.getComponent(cc.Label)['_updateRenderData'](true);
            var size = widget.getComponent(cc.Label).node.getContentSize();
            widget.setContentSize(cc.size(size.width, size.height + 6));
            this._listViewLog.content.addChild(widget);
            widget.anchorX = 0;
            widget.anchorY = 0;
            widget.x = 0;
            widget.y = -widget.height - 6 - this._listViewLog.content.height;
            this._listViewLog.content.height += widget.height + 6;
        }
    }
    _updateNextRewardTime() {
        var event = this._eventList[this._eventList.length - 1];
        if (this._cityState == TerritoryConst.STATE_COUNTDOWN || this._cityState == TerritoryConst.STATE_RIOT) {
            var nextTimeStr = TerritoryHelper.getNextEventTime(this._cityData, event);
            if (nextTimeStr == '-') {
                this._updateEvents();
                return;
            }
            if (this._nextRewardTime) {
                var label2 = this._nextRewardTime.children[1].getComponent(cc.Label);;
                this._nextRewardTime.active = (true);
                label2.string = ('[' + (nextTimeStr + ']'));
            }
        }
    }
    _updateEventLable(eventList, eventInfoList) {
        if (eventList.length != eventInfoList.length) {
            return;
        }
        var index = 1;
        var totalCount = eventList.length;
        var start = index;
        // var timeStart = os.clock();
        // for (var i = 0; i < totalCount; i += 1) {
        //     var eventInfo = eventInfoList[i];
        //     var event = eventList[i];
        //     // var label = new ccui.RichText();
        //     var label = RichTextExtend.createWithContent(null);
        //     this._updateEventLabel(label.node, eventInfo, event);
        // }
        // this._eventList = eventList;

     
        var count = 1;

        var func = function(){
            var i = eventList.length - count;
            if(count>5||i<=0)
            {
                this.unschedule(callFunc); 
                this._eventList = eventList;
                this._listViewLog.scrollToBottom();
                return;
            }
            count = count + 1;
            var eventInfo = eventInfoList[i];
            var event = eventList[i];
            // var label = new ccui.RichText();
            var label = RichTextExtend.createWithContent(null);
            this._updateEventLabel(label.node, eventInfo, event);
        }.bind(this);
        
        var callFunc = handler(this,func);
        this.schedule(callFunc,0.1);
        
    }
    _updateEventLabel(label, eventCfg, serverData) {
        var contents = null;
        var fontColor = Colors.colorToNumber(Colors.BRIGHT_BG_ONE);
        if (serverData.event_type == TerritoryConst.RIOT_TYPE_OPEN) {
            if (!eventCfg) {
                return;
            }
            contents = TextHelper.parseConfigText(eventCfg.riot_description);
            fontColor = Colors.colorToNumber(Colors.getColor(6));
        } else if (serverData.event_type == TerritoryConst.RIOT_TYPE_OVER) {
            contents = TextHelper.parseConfigText(eventCfg.solve_description);
            fontColor = Colors.colorToNumber(Colors.BRIGHT_BG_GREEN);
        } else if (serverData.event_type == TerritoryConst.PARTOL_TYPE_FINISH) {
            contents = TextHelper.parseConfigText(eventCfg.description);
            fontColor = Colors.colorToNumber(Colors.BRIGHT_BG_GREEN);
        } else {
            contents = TextHelper.parseConfigText(eventCfg.description);
            fontColor = Colors.colorToNumber(Colors.BRIGHT_BG_TWO);
        }
        var richContents = [];
        var fontSize = 22;
        var baseId = G_UserData.getTerritory().getTerritoryHeroId(this._cityId);
        if (baseId == null || baseId == 0) {
            return;
        }
        var heroData = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(baseId);
        if (heroData == null) {
            return 0;
        }
        let date = new Date();
        date.setTime(serverData.time * 1000);
        var limitLevel = G_UserData.getTerritory().getTerritoryLimitLevel(this._cityId);
        var limitRedLevel = G_UserData.getTerritory().getTerritoryLimitRedLevel(this._cityId);
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, limitLevel, limitRedLevel);
        var timeStr = {
            type: 'text',
            msg: '[' + (Util.formatTimeStr(date.getHours()) + ":" + Util.formatTimeStr(date.getMinutes()) + ":" + Util.formatTimeStr(date.getSeconds()) + ']'),
            color: Colors.colorToNumber(Colors.BRIGHT_BG_TWO),
            fontSize: fontSize,
            opacity: 255
        };
        richContents.push(timeStr);
        function genAwardRichDesc(awards) {
            if (awards.length <= 0) {
                return;
            }
            for (var i in awards) {
                var value = awards[i];
                if (value.type > 0) {
                    var param = TypeConvertHelper.convert(value.type, value.value);
                    var color = Colors.colorToNumber(Colors.getColor(param.cfg.color));
                    var itemDesc = param.cfg.name + ('x' + (value.size + ' '));
                    richContents.push({
                        type: 'text',
                        msg: itemDesc,
                        color: color,
                        fontSize: fontSize,
                        opacity: 255
                    });
                }
            }
        }
        for (var i in contents) {
            var content = contents[i];
            var text = content.content;
            var color = fontColor;
            var outlineColor = null;
            var outlineSize = null;
            if (text == 'hero') {
                color = Colors.colorToNumber(Colors.getColor(heroParam.color));
                text = heroParam.name;
                if (heroParam.color == 7) {
                    outlineColor = Colors.colorToNumber(Colors.getColorOutline(heroParam.color));
                    outlineSize = 2;
                }
            } else if (text == 'reward') {
                var awards = serverData.awards || {};
                genAwardRichDesc(awards);
                text = '';
            } else if (text == 'name') {
                text = serverData.fname;
                color = Colors.colorToNumber(Colors.getOfficialColor(serverData.office_level));
            } else if (text == 'riot_name') {
                color = Colors.colorToNumber(Colors.getColor(eventCfg.riot_color));
                text = eventCfg.riot_name;
            }
            richContents.push({
                type: 'text',
                msg: text,
                color: color,
                fontSize: fontSize,
                opacity: 255,
                outlineColor: outlineColor,
                outlineSize: outlineSize
            });
        }
        label.setContentSize(cc.size(360, 0));
        label.anchorX = 0;
        label.anchorY = 0;
        (label.getComponent(cc.RichText) as cc.RichText).maxWidth = 360;
        (label.getComponent(cc.RichText) as cc.RichText).lineHeight = 7 + fontSize;
        label.getComponent(cc.RichText).string = UIHelper.getRichTextContent(richContents);
        // (label.getComponent(cc.RichText) as cc.RichText)['_updateRenderData'](true);
        let size = label.getContentSize();
        let contentSize = this._listViewLog.content.getContentSize();
        label.x = 0;
        label.y = -contentSize.height - label.height;
        this._listViewLog.content.height = contentSize.height + size.height;
        // label.setVerticalSpace(7);
        // label.setCascadeOpacityEnabled(true);
        // label.ignoreContentAdaptWithSize(false);
        // label.formatText();
        // var virtualContentSize = label.getVirtualRendererSize();
        // var virtualContentSize = label.getContentSize();
        // label.setContentSize(cc.size(virtualContentSize.width, virtualContentSize.height + 7));
        this._listViewLog.content.addChild(label);
        return label;
    }
    _onEventPartolAward(id, message) {
        this.close();
    }
    _onEventRiotHelper(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_Prompt.showTip('军团求助成功');
        this.updateUI(this._cityId);
    }
    _onEventPatrol(id, message) {
        var callback = function () {
            this.updateUI(this._cityId);
        }.bind(this);
        this._btnPatrolClick.setEnabled(false);
        this._commonAvatar.node.stopAllActions();
        var territoryCfg = this._cityData.cfg;
        var talkMsg = TerritoryHelper.getBubbleContentById(territoryCfg.start_hero_bubble);
        this._commonAvatar.setBubble(talkMsg, 0.1, 2, true, PopupTerritoryPatrol.MAX_BUBBLE_WIDTH);
        var delay = cc.delayTime(1.5);
        var sequence = cc.sequence(delay, cc.callFunc(callback));
        this._commonAvatar.node.runAction(sequence);
    }
}