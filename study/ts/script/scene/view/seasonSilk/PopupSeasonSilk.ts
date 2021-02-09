const { ccclass, property } = cc._decorator;

import CommonTabGroupHorizon2 from '../../../ui/component/CommonTabGroupHorizon2'
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { G_UserData, G_SignalManager, G_Prompt, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import ListView from '../recovery/ListView';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import PopupSilkbagDetail from '../silkbag/PopupSilkbagDetail';
import { SeasonSportHelper } from '../seasonSport/SeasonSportHelper';
import PopupSilkModifyName from './PopupSilkModifyName';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import { SeasonSilkConst } from '../../../const/SeasonSilkConst';
import SeasonSilkGroupIcon from './SeasonSilkGroupIcon';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import PopupAlert from '../../../ui/PopupAlert';
import SeasonSilkIcon from './SeasonSilkIcon';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import SeasonSilkListCell from './SeasonSilkListCell';
import PopupSilkRecommand from './PopupSilkRecommand';

@ccclass
export default class PopupSeasonSilk extends PopupBase {

    @property({ type: CommonNormalLargePop, visible: true })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({ type: ListView, visible: true })
    _ListViewGroup: ListView = null;

    @property({ type: cc.Button, visible: true })
    _buttonDetail: cc.Button = null;

    @property({ type: cc.Node, visible: true })
    _silkbagPanel: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imagePlateButtom: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imagePlateFront: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _silkEquipped: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _silkUnEquip: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _silkLock: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textGroupBaseName1: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textGroupBaseName2: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnModifyName: cc.Button = null;

    @property({ type: cc.Node, visible: true })
    _panelModifiedName: cc.Node = null;

    @property({ type: CommonTabGroupHorizon2, visible: true })
    _nodeTabRoot: CommonTabGroupHorizon2 = null;

    @property({ type: ListView, visible: true })
    _listViewSilk: ListView = null;

    @property({ type: cc.Prefab, visible: true })
    _seasonSilkGroupIconPrefab: cc.Prefab = null;

    @property({ type: cc.Prefab, visible: true })
    _seasonSilkIconPrefab: cc.Prefab = null;

    @property({ type: cc.Prefab, visible: true })
    _seasonSilkListCellPrefab: cc.Prefab = null;
    _willPlayAllEffects: boolean;
    _signalListnerApplyRmdSilk: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;

    public static waitEnterMsg(callBack) {
        function onMsgCallBack(id, message) {
            callBack();
        }
        G_UserData.getSeasonSport().c2sFightsEntrance();
        var signal = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_ENTRY_SUCCESS, onMsgCallBack);
        return signal;
    }

    private _selectTabIndex;
    private _curSilkBaseIndex;
    private _silkGroupInfo: any[];

    private _goldSilk: any[];
    private _redSilk: any[];
    private _orangeSilk: any[];
    private _curGroupPos;
    private _curGroupName;
    private _slotMax;
    private _seasonSilkIcons: SeasonSilkIcon[];

    private _signalSilkEquip;
    private _signalShowClose;
    private _signalHideClose;
    private _signalListnerSeasonEnd;

    public onCreate() {
        this._selectTabIndex = 1;
        this._curSilkBaseIndex = 1;
        this._silkGroupInfo = [];
        this._willPlayAllEffects = false;
        this._panelModifiedName

        this._goldSilk = G_UserData.getSeasonSilk().getGoldSilkInfo();
        this._redSilk = G_UserData.getSeasonSilk().getRedSilkInfo();
        this._orangeSilk = G_UserData.getSeasonSilk().getOrangeSilkInfo();
        this._curGroupPos = 1;
        this._curGroupName = '';
        this._commonNodeBk.setTitle(Lang.get('season_silk_equip_title'));
        this._commonNodeBk.setCloseButtonLocalZOrder(100);
        this._commonNodeBk.addCloseEventListener(handler(this, this._onBtnClose));
        this._initSeasonSlot();
        this._initSilkGroupView();
        this._initSilkBaseView();
        this._initSilkListView();
    }

    public onEnter() {
        G_UserData.getSeasonSport().setInSeasonSilkView(true);
        this._signalSilkEquip = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_SILKEQUIP_SUCCESS, handler(this, this._onEventSilkEquipSuccess));
        this._signalShowClose = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_CLOSESILKDETAIL, handler(this, this._onEventShowCloseBtn));
        this._signalHideClose = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_OPENSILKDETAIL, handler(this, this._onEventHideCloseBtn));
        this._signalListnerSeasonEnd = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_END, handler(this, this._onEventListnerSeasonEnd));
        this._signalListnerApplyRmdSilk = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_APPLY_RECOMMAND_SILK, handler(this, this._onEventListnerApplyRmdSilk));
        this._silkGroupInfo = G_UserData.getSeasonSport().getSilkGroupInfo();
        this._initFirstSilkGroupName();
        this._updateSilkGroupView();
        this._updateSilkBaseView();
        this._updateSilkListView();
        this._updateSilkBasePanelInfo();
        this._playRotatePlateInBaseView();
    }

    public onExit() {
        this._signalSilkEquip.remove();
        this._signalShowClose.remove();
        this._signalHideClose.remove();
        this._signalListnerSeasonEnd.remove();
        this._signalSilkEquip = null;
        this._signalShowClose = null;
        this._signalHideClose = null;
        this._signalListnerSeasonEnd = null;
        this._signalListnerApplyRmdSilk.remove();
        this._signalListnerApplyRmdSilk = null;
        this._stopRotatePlateInBaseView();
        G_UserData.getSeasonSport().setInSeasonSilkView(false);
    }

    private _onEventListnerSeasonEnd() {
        G_UserData.getSeasonSport().c2sFightsEntrance();
        this.close();
    }

    _onEventListnerApplyRmdSilk() {
        this._willPlayAllEffects = true;
    }

    private _onBtnClose() {
        G_UserData.getSeasonSport().c2sFightsEntrance();
        this.close();
    }

    private _onEventShowCloseBtn() {
        this._commonNodeBk.setCloseVisible(true);
    }

    private _onEventHideCloseBtn() {
        this._commonNodeBk.setCloseVisible(false);
    }

    public onBtnDetail() {
        var curGroupData: any = this._silkGroupInfo[this._curGroupPos - 1];
        if (curGroupData.silkbag == null || curGroupData.silkbag.length == 0) {
            G_Prompt.showTip(Lang.get('silkbag_no_detail_tip'));
            return;
        }
        var silkbagIds = [];
        for (let key in curGroupData.silkbag) {
            var value = curGroupData.silkbag[key];
            if (value > 0) {
                silkbagIds.push(value);
            }
        }
        this._commonNodeBk.setCloseVisible(false);
        G_SceneManager.openPopup(Path.getPrefab("PopupSilkbagDetail", "silkbag"), (popup: PopupSilkbagDetail) => {
            popup.openWithAction();
            popup.updateUI2(silkbagIds);
            popup.setCloseCallBack(handler(this, this._onEventShowCloseBtn));
        })
    }

    private _initSeasonSlot() {
        this._slotMax = SeasonSportHelper.getCurSlotNum();
    }

    public onBtnModifyName(sender) {
        this._commonNodeBk.setCloseVisible(false);
        G_SceneManager.openPopup(Path.getPrefab("PopupSilkModifyName", "seasonSilk"), (popupSilkModifyName: PopupSilkModifyName) => {
            popupSilkModifyName.init(this._silkGroupInfo[this._curGroupPos-1], handler(this, this._updateGroupName));
            popupSilkModifyName.openWithAction();
            popupSilkModifyName.setCurGroupName(this._curGroupName);
            popupSilkModifyName.setCloseCallBack(handler(this, this._onEventShowCloseBtn));
        });
    }

    onBtnRecommand(sender) {
        this._commonNodeBk.setCloseVisible(false);
        G_SceneManager.openPopup('prefab/seasonSilk/PopupSilkRecommand', (p:PopupSilkRecommand)=>{
            p.ctor(this._curGroupPos -1);
            p.setCloseCallBack(handler(this, this._onEventShowCloseBtn));
            p.openWithAction();
        })
    }

    private _initFirstSilkGroupName() {
        if (this._silkGroupInfo && this._silkGroupInfo[0]) {
            if (this._silkGroupInfo[0].name != '') {
                this._curGroupName = this._silkGroupInfo[0].name;
            } else {
                this._curGroupName = Lang.get('season_silk_group_initname2') + (1).toString();
            }
        }
    }

    private _updateGroupName(name) {
        if (this._curGroupName != null) {
            this._textGroupBaseName2.string = name;
            this._updateSilkGroupView();
        }
    }

    private _onGroupItemUpdate(node: cc.Node, index) {
        var maxGroup = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_SILK_GROUPCOUNT).content);
        if (maxGroup <= 0) {
            return;
        }
        let item: SeasonSilkGroupIcon = node.getComponent(SeasonSilkGroupIcon);
        var data: any = {};
        var curIndex: number = index + 1;
        data.pos = curIndex;
        data.isSelected = this._curGroupPos == curIndex || false;
        if (this._silkGroupInfo && this._silkGroupInfo[curIndex - 1]) {
            if (this._silkGroupInfo[curIndex - 1].silkbag != null && this._silkGroupInfo[curIndex - 1].silkbag.length > 0) {
                data.state = SeasonSilkConst.SILK_GROUP_SATE_EQUIPPED;
            } else if (this._isUnLockState(curIndex)) {
                data.state = SeasonSilkConst.SILK_GROUP_SATE_UNLOCK;
            } else {
                data.state = SeasonSilkConst.SILK_GROUP_SATE_UNEQUIP;
            }
            if (this._silkGroupInfo[curIndex - 1].name != '') {
                data.name = this._silkGroupInfo[curIndex - 1].name;
            } else {
                data.name = Lang.get('season_silk_group_initname2') + (curIndex).toString();
            }
        } else {
            data.state = SeasonSilkConst.SILK_GROUP_SATE_LOCK;
            data.name = Lang.get('season_silk_group_initname2') + (curIndex).toString();
        }
        item.setCustomCallback(handler(this, this._onGroupItemTouch));
        item.updateUI(data);
    }

    private _onGroupItemSelected(item, index) {
    }

    private _onGroupItemTouch(data) {
        if (data.state == SeasonSilkConst.SILK_GROUP_SATE_LOCK) {
            var needGold = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_SILKGROUP_UNLOCK).content);
            var [success, popFunc] = LogicCheckHelper.enoughCash(needGold);
            if (success) {
                var proirNum = this._silkGroupInfo.length + 1;
                if (data.pos > proirNum) {
                    G_Prompt.showTip(Lang.get('season_tip_firtsopengroup', { num: proirNum }));
                    return;
                }
                let callbackOK = () => {
                    this._curSilkBaseIndex = 1;
                    this._curGroupPos = data.pos;
                    this._curGroupName = data.name;
                    G_Prompt.showTip(Lang.get('season_tip_opengroup', { num: data.pos }));
                    G_UserData.getSeasonSport().c2sFightsSilkbagSetting(this._curGroupPos - 1, data.name, null);
                }
                let callbackCancel = () => {
                    this._onEventShowCloseBtn();
                }
                let callbackExit = () => {
                    this._onEventShowCloseBtn();
                }
                this._onEventHideCloseBtn();
                var freeOpenSilkGroup = G_UserData.getSeasonSport().getFreeOpenSilkGroup();
                var danName = SeasonSportHelper.getDanInfoByStar(freeOpenSilkGroup[data.pos - 1]).name;
                var content = Lang.get('season_silk_unlock_content', {
                    money: needGold,
                    dan: danName
                });
                var title = Lang.get('season_silk_unlock_title');
                G_SceneManager.openPopup(Path.getCommonPrefab("PopupAlert"), (popup: PopupAlert) => {
                    popup.init(title, content, callbackOK.bind(this), callbackCancel.bind(this), callbackExit);
                    popup.openWithAction();
                });
            } else {
                popFunc();
            }
        } else if (data.state == SeasonSilkConst.SILK_GROUP_SATE_UNLOCK) {
            this._curSilkBaseIndex = 1;
            this._curGroupPos = data.pos;
            this._curGroupName = data.name;
            G_UserData.getSeasonSport().c2sFightsSilkbagSetting(this._curGroupPos - 1, data.name, null);
        } else if (data.state == SeasonSilkConst.SILK_GROUP_SATE_UNEQUIP || data.state == SeasonSilkConst.SILK_GROUP_SATE_EQUIPPED) {
            this._curSilkBaseIndex = 1;
            this._curGroupPos = data.pos;
            this._curGroupName = data.name;
            this._updateSilkGroupView();
            this._updateSilkBaseView();
            this._updateSilkBasePanelInfo();
            this._updateSilkListView();
        }
    }

    private _initSilkGroupView() {
        this._ListViewGroup.setTemplate(this._seasonSilkGroupIconPrefab);
        this._ListViewGroup.setCallback(handler(this, this._onGroupItemUpdate));
    }

    private _updateSilkGroupView() {
        var maxGroup = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_SILK_GROUPCOUNT).content);
        if (maxGroup <= 0) {
            return;
        }
        this._ListViewGroup.resize(maxGroup);
    }

    private _isUnLockState(curIndex) {
        var curStar = G_UserData.getSeasonSport().getCurSeason_Star();
        var freeOpenSilkGroup = G_UserData.getSeasonSport().getFreeOpenSilkGroup();
        if (freeOpenSilkGroup[curIndex - 1] != null && curStar >= freeOpenSilkGroup[curIndex - 1]) {
            return true;
        }
        return false;
    }

    private _getCurGroupData() {
        var pos = this._curGroupPos - 1;
        for (let key in this._silkGroupInfo) {
            var value = this._silkGroupInfo[key];
            if (value.idx == pos) {
                return value;
            }
        }
        return null;
    }

    private _updateSilkBasePanelInfo() {
        if (this._silkGroupInfo && this._silkGroupInfo[this._curGroupPos - 1]) {
            if (this._silkGroupInfo[this._curGroupPos - 1].silkbag != null) {
                this._silkLock.node.active = false;
                this._silkUnEquip.node.active = false;
                this._silkEquipped.node.active = true;
            } else {
                this._silkLock.node.active = false;
                this._silkUnEquip.node.active = true;
                this._silkEquipped.node.active = false;
            }
            if (this._silkGroupInfo[this._curGroupPos - 1].name != '') {
                this._textGroupBaseName1.string = this._silkGroupInfo[this._curGroupPos - 1].name;
                this._textGroupBaseName2.string = this._silkGroupInfo[this._curGroupPos - 1].name;
            } else {
                this._textGroupBaseName1.string = Lang.get('season_silk_group_initname2') + (this._curGroupPos).toString();
                this._textGroupBaseName2.string = Lang.get('season_silk_group_initname2') + (this._curGroupPos).toString();
            }
        } else {
            this._textGroupBaseName1.string = Lang.get('season_silk_group_initname2') + this._curGroupPos;
            this._textGroupBaseName2.string = Lang.get('season_silk_group_initname2') + this._curGroupPos;
            this._silkLock.node.active = true;
            this._silkUnEquip.node.active = false;
            this._silkEquipped.node.active = false;
        }
        this._textGroupBaseName1.node.active = false;
    }

    private _initSilkBaseView() {
        var paramId = G_UserData.getSeasonSport().getSeason_Stage();
        this._seasonSilkIcons = [];
        for (var i = 0; i < this._slotMax; i++) {
            let seasonSilkIcon = cc.instantiate(this._seasonSilkIconPrefab).getComponent(SeasonSilkIcon);
            seasonSilkIcon.init(i + 1, handler(this, this._onClickSilkBaseIcon));
            seasonSilkIcon.node.active = true;
            let posX = SeasonSilkConst.SEASON_SILKBASE_POS[paramId][i].x - this._silkbagPanel.width / 2;
            let posY = SeasonSilkConst.SEASON_SILKBASE_POS[paramId][i].y - this._silkbagPanel.height / 2;
            seasonSilkIcon.node.setPosition(posX, posY);
            this._seasonSilkIcons.push(seasonSilkIcon);
            this._silkbagPanel.addChild(seasonSilkIcon.node);
        }
    }

    private _updateSilkBaseView() {
        if (this._silkGroupInfo && this._silkGroupInfo[this._curGroupPos - 1]) {
            var groupData = this._silkGroupInfo[this._curGroupPos - 1];
            if (groupData.silkbag && (groupData.silkbag).length > 0) {
                for (let index = 1; index <= (groupData.silkbag).length; index++) {
                    if (groupData.silkbag[index - 1] == 0 || groupData.silkbag[index - 1] == null) {
                        this._curSilkBaseIndex = index;
                        break;
                    }
                }
            }
            for (let index = 1; index <= this._slotMax; index++) {
                var data: any = {};
                data.groupPos = groupData.idx;
                if (groupData.name != null && groupData.name != '') {
                    data.groupName = groupData.name;
                } else {
                    data.groupName = Lang.get('season_silk_group_initname2') + (groupData.idx + 1).toString();
                }
                if (groupData.silkbag != null && groupData.silkbag[index - 1]) {
                    data.silkId = groupData.silkbag[index - 1];
                } else {
                    data.silkId = 0;
                }
                data.silkPos = index;
                data.silkbag = groupData.silkbag;
                this._seasonSilkIcons[index - 1].updateUI(data);
                this._seasonSilkIcons[index - 1].setSelected(index == this._curSilkBaseIndex && true || false);
            }
        }
    }

    private _onClickSilkBaseIcon(index) {
        if (index == this._curSilkBaseIndex) {
            return;
        }
        this._curSilkBaseIndex = index;
        for (let index = 1; index <= this._slotMax; index++) {
            this._seasonSilkIcons[index - 1].setSelected(index == this._curSilkBaseIndex && true || false);
        }
    }

    private _onEventSilkEquipSuccess(id, message) {
        if (message.silkbag_config == null) {
            return;
        }
        var curGroupData = message.silkbag_config;
        this._silkGroupInfo[this._curGroupPos - 1] = curGroupData;
        if (G_UserData.getSeasonSport().getModifySilkGroupName()) {
            this._curGroupName = this._silkGroupInfo[this._curGroupPos - 1].name;
            G_UserData.getSeasonSport().setModifySilkGroupName(false);
            if (this._willPlayAllEffects) {
                this._willPlayAllEffects = false;
                this._playAllEffects(curGroupData.silkbag);
            }
        } else {
            if (curGroupData.silkbag != null) {
                if (curGroupData.silkbag[this._curSilkBaseIndex - 1] != null && parseInt(curGroupData.silkbag[this._curSilkBaseIndex - 1]) > 0) {
                    this._playEffect(this._curSilkBaseIndex, curGroupData.silkbag[this._curSilkBaseIndex - 1]);
                }
            }
        }
        this._updateSilkGroupView();
        this._updateSilkBaseView();
        this._updateSilkBasePanelInfo();
        this._updateSilkListView();
    }

    private _playEffect(index, silkId) {
        if (silkId == null || silkId == 0) {
            return;
        }
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, silkId);
        var effectName = SeasonSilkConst.SILK_EQUIP_EFFECTNAME[param.color];
        this._seasonSilkIcons[index - 1].playEffect(effectName);
    }

    _playAllEffects(silkBag) {
        silkBag = silkBag || {};
        for (var index in silkBag) {
            var silkId = silkBag[index];
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, silkId);
            var effectName = SeasonSilkConst.SILK_EQUIP_EFFECTNAME[param.color];
            this._seasonSilkIcons[index].playEffect(effectName);
        }
    }

    private _playRotatePlateInBaseView() {
        this._imagePlateButtom.node.runAction(cc.repeatForever(cc.rotateBy(60, 360)));
        this._imagePlateFront.node.runAction(cc.repeatForever(cc.rotateBy(60, -360)));
    }

    private _stopRotatePlateInBaseView() {
        this._imagePlateButtom.node.stopAllActions();
        this._imagePlateFront.node.stopAllActions();
    }

    private _initSilkListView() {
        this._listViewSilk.setTemplate(this._seasonSilkListCellPrefab);
        this._listViewSilk.setCallback(handler(this, this._onSilkItemUpdate));
        var tabNameList = [];
        if (this._orangeSilk != null && (this._orangeSilk).length > 0) {
            tabNameList.push(Lang.get('season_silk_type_orange'));
        }
        if (this._redSilk != null && (this._redSilk).length > 0) {
            tabNameList.push(Lang.get('season_silk_type_red'));
        }
        if (this._goldSilk != null && (this._goldSilk).length > 0) {
            tabNameList.push(Lang.get('season_silk_type_gold'));
        }
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            textList: tabNameList
        };
        var maxNum = tabNameList.length;
        if (maxNum > 0) {
            // this._nodeTabRoot.node.x = (SeasonSilkConst.SEASON_ROOTTAB_POS[maxNum]);
            this._nodeTabRoot.node.x = -45;
        }
        this._nodeTabRoot.recreateTabs(param);
    }

    private _updateSilkListView() {
        var count = 0;
        if (this._selectTabIndex == 1) {
            count = this._orangeSilk.length;
        } else if (this._selectTabIndex == 2) {
            count = this._redSilk.length;
        } else if (this._selectTabIndex == 3) {
            count = this._goldSilk.length;
        }
        this._listViewSilk.resize(count);
    }

    private _onSilkItemUpdate(node: cc.Node, index) {
        let item: SeasonSilkListCell = node.getComponent(SeasonSilkListCell);
        var pos = index + 1;
        var data: any = {};
        if (this._selectTabIndex == 1) {
            data = this._orangeSilk[pos - 1].cfg;
        } else if (this._selectTabIndex == 2) {
            data = this._redSilk[pos - 1].cfg;
        } else if (this._selectTabIndex == 3) {
            data = this._goldSilk[pos - 1].cfg;
        }
        data.isWeared = false;
        if (this._silkGroupInfo[this._curGroupPos - 1].silkbag != null) {
            var silkbag = this._silkGroupInfo[this._curGroupPos - 1].silkbag;
            for (let i in silkbag) {
                var silkId = silkbag[i];
                if (data.id == silkId) {
                    data.isWeared = true;
                    break;
                }
            }
        }
        item.setCustomCallback(handler(this, this._onSilkItemTouch));
        item.updateUI(data);
    }

    private _onSilkItemSelected(item, index) {
    }

    private _onSilkItemTouch(data) {
        var curGroupData = this._silkGroupInfo[this._curGroupPos - 1];
        if (curGroupData.name == null || curGroupData.name == '') {
            curGroupData.name = Lang.get('season_silk_group_initname2') + parseInt(curGroupData.idx + 1);
        }
        if (curGroupData.silkbag == null) {
            curGroupData.silkbag = {};
            for (let index = 1; index <= this._slotMax; index++) {
                curGroupData.silkbag[index - 1] = 0;
            }
        }
        for (var index = 1; index <= this._slotMax; index++) {
            if (this._curSilkBaseIndex == index) {
                curGroupData.silkbag[index - 1] = data.id;
            } else {
                if (curGroupData.silkbag[index - 1] == null) {
                    curGroupData.silkbag[index - 1] = 0;
                }
            }
        }
        G_UserData.getSeasonSport().c2sFightsSilkbagSetting(curGroupData.idx, curGroupData.name, curGroupData.silkbag);
    }

    private _onTabSelect(index, sender) {
        if ((index + 1) == this._selectTabIndex) {
            return;
        }
        this._selectTabIndex = index + 1;
        this._listViewSilk.init();
        this._updateSilkListView();
    }
}