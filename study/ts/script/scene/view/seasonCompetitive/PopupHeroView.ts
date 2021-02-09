const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'
import CommonTabGroupHorizon from '../../../ui/component/CommonTabGroupHorizon'
import PopupBase from '../../../ui/PopupBase';
import { G_ResolutionManager, G_SignalManager, G_UserData, G_EffectGfxMgr, Colors } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { SeasonSportHelper } from '../seasonSport/SeasonSportHelper';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import { Lang } from '../../../lang/Lang';
import ListView from '../recovery/ListView';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import SeasonHeroIcon from './SeasonHeroIcon';
import SeasonPet2Icon from './SeasonPet2Icon';
import { ObjKeyLength } from '../../../utils/GlobleFunc';

@ccclass
export default class PopupHeroView extends PopupBase {
    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _panel_Center: cc.Node = null;
    @property({ type: CommonTabGroupHorizon, visible: true })
    _nodeTabRoot: CommonTabGroupHorizon = null;
    @property({ type: cc.Label, visible: true })
    _textBanPickDesc: cc.Label = null;
    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnForbit: CommonButtonLevel0Highlight = null;
    @property({ type: cc.Node, visible: true })
    _nodeForbitEffect: cc.Node = null;
    @property({ type: cc.Sprite, visible: true })
    _imageCentent: cc.Sprite = null;
    @property({ type: cc.Node, visible: true })
    _panelContent: cc.Node = null;
    @property({ type: ListView, visible: true })
    _listView: ListView = null;
    @property({ type: cc.Label, visible: true })
    _textRedCountDesc: cc.Label = null;
    @property({ type: cc.Node, visible: true })
    _textRedHeroCount: cc.Node = null;
    @property({ type: cc.Label, visible: true })
    _textGoldenCountDesc: cc.Label = null;
    @property({ type: cc.Node, visible: true })
    _textGoldenHeroCount: cc.Node = null;
    @property({ type: cc.Prefab, visible: true })
    _seasonHeroIconPrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _seasonPet2IconPrefab: cc.Prefab = null;

    private _isInBanView;
    private _selectTabIndex;
    private _curTouchIndex;
    private _selectTabCallback;
    private _touchCallback;
    private _curOwnLockData: any[];
    private _heroListInfo: any;
    private _redHeroListInfo: any;
    private _petListData: any[];
    private _transformHeroInfo: any[];
    private _isEnoughSquadRedHeros;
    private _isExistSquadTransHero;
    private _isEnoughSquadTransHero;
    private _closeCallBack;
    private _banHeroData: any[];
    private _banPetId;

    private _signalFightsBanCheck;
    _goldenHeroListInfo: {};
    private _isEnoughSquadGoldenHeros: boolean;
    _canShowGoldenHero: boolean;
    public init(bBanPick, tabIndex, selectTabCallback, touchCallback) {
        this._isInBanView = bBanPick;
        this._selectTabIndex = tabIndex;
        this._curTouchIndex = 1;
        this._selectTabCallback = selectTabCallback;
        this._touchCallback = touchCallback;
        this._curOwnLockData = [];
        this._heroListInfo = {};
        this._redHeroListInfo = {};
        this._goldenHeroListInfo = {};
        this._transformHeroInfo = [];
        this._isEnoughSquadRedHeros = false;
        this._isEnoughSquadGoldenHeros = false;
        this._isEnoughSquadTransHero = false;
        this._canShowGoldenHero = false;
        
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, handler(this, this._onCloseView));
        this._btnForbit.addClickEventListenerEx(handler(this, this._onBanPick));
    }

    public onCreate() {
        this._initBanPickView();
        this._initHeroListData();
        this._initListView(this._listView);
        this._onInitTab();
        var size = G_ResolutionManager.getDesignCCSize();
        this._panelTouch.setContentSize(size);
    }

    public onEnter() {
        this._signalFightsBanCheck = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_HEROS_BAN, handler(this, this._onEventFightsBanCheck));
        this._updateListView(this._selectTabIndex);
    }

    public onExit() {
        this._signalFightsBanCheck.remove();
        this._signalFightsBanCheck = null;
    }

    private _onCloseView() {
        if (this._isInBanView) {
            return;
        }
        if (this._closeCallBack) {
            this._closeCallBack();
        }
        this.close();
    }

    private _onBanPick() {
        var banData = [];
        var maxBanHeroNum = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content);
        for (var index = 0; index < maxBanHeroNum; index++) {
            if (this._banHeroData[index]) {
                banData.push(this._banHeroData[index].heroId);
            }
        }
        var pets = [];
        pets.push(this._banPetId);
        G_UserData.getSeasonSport().c2sFightsBan(banData, pets);
        if (this._closeCallBack) {
            this._closeCallBack();
        }
        this.close();
    }

    private _onEventFightsBanCheck(id, message) {
        if (message == null) {
            return;
        }
        if (this._isInBanView) {
            if (this._closeCallBack) {
                this._closeCallBack();
            }
            this.close();
        }
    }

    public setCloseCallBack(closeCallback) {
        this._closeCallBack = closeCallback;
    }

    public setSyncBanHeroData(banHeroData) {
        this._banHeroData = banHeroData;
    }

    public setSyncBanPetData(banPetId) {
        this._banPetId = banPetId || 0;
    }

    private _checkForbitBtn() {
        var recordCount = 0;
        var maxBanHeroNum = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content);
        for (let key in this._banHeroData) {
            var value = this._banHeroData[key];
            if (value != null && value.heroId > 0) {
                recordCount = recordCount + 1;
            }
        }
        return maxBanHeroNum == recordCount && this._banPetId > 0;
    }

    private _updateForbitEffect() {
        var bEnable = this._checkForbitBtn();
        this._btnForbit.setEnabled(bEnable);
        if (bEnable) {
            this._nodeForbitEffect.active = true;
            this._nodeForbitEffect.removeAllChildren();
            G_EffectGfxMgr.createPlayGfx(this._nodeForbitEffect, 'effect_anniufaguang_big2');
        } else {
            this._nodeForbitEffect.active = false;
        }
    }

    private _initBanPickView() {
        this._btnForbit.setVisible(this._isInBanView);
        this._btnForbit.setString(Lang.get('season_banpick_forbit'));
        this._textBanPickDesc.node.active = (this._isInBanView);
        this._textRedCountDesc.node.active = (!this._isInBanView);
        this._textGoldenCountDesc.node.active =(!this._isInBanView);
        if (this._isInBanView) {
            var listViewHeight = SeasonSportConst.SEASON_POPHEROVIEW_HEIGHTNAN - SeasonSportConst.SEASON_POPHEROVIEW_LISTVIEW_OFF;
           // this._listView.node.y = (SeasonSportConst.SEASON_POPHEROVIEW_HEIGHTNAN);
           // this._panelContent.y = (SeasonSportConst.SEASON_POPHEROVIEW_HEIGHTNAN);
            this._imageCentent.node.setContentSize(this._imageCentent.node.getContentSize().width, SeasonSportConst.SEASON_POPHEROVIEW_HEIGHTNAN);
            this._panelContent.setContentSize(this._panelContent.getContentSize().width, SeasonSportConst.SEASON_POPHEROVIEW_HEIGHTNAN);
            this._listView.node.setContentSize(this._listView.node.getContentSize().width, listViewHeight);
        }
    }

    private _initHeroListData() {
        this._transformHeroInfo = G_UserData.getSeasonSport().getTransformCardHeros();
        this._heroListInfo = G_UserData.getSeasonSport().getHeroListInfo();
        this._redHeroListInfo = G_UserData.getSeasonSport().getRedHeroListInfo();
        this._goldenHeroListInfo = G_UserData.getSeasonSport().getGoldenHeroListInfo();
        this._petListData = G_UserData.getSeasonSport().getPetListInfo();
        this._canShowGoldenHero =  ObjKeyLength(this._goldenHeroListInfo)  > 0;
        this._initRedHeroDesc();
        this._initGoldenHeroDesc();
    }

    _initGoldenHeroDesc() {
        if (!this._canShowGoldenHero) {
            this._textGoldenCountDesc.node.active = (false);
            this._textGoldenHeroCount.active = (false);
            return;
        }
        this._textGoldenHeroCount.active = (!this._isInBanView);
        this._textGoldenHeroCount.removeAllChildren();
        var richText = RichTextExtend.createRichTextByFormatString(Lang.get('season_squadredhero_count', {
            num1: 0,
            num2: 1
        }), {
            defaultColor: Colors.BRIGHT_BG_TWO,
            defaultSize: 20,
            other: { [1]: { fontSize: 20 } }
        });
        richText.node.x = (0);
        richText.node.y = (6);
        this._textGoldenHeroCount.addChild(richText.node);
    }

    private _initRedHeroDesc() {
        this._textRedHeroCount.active = (!this._isInBanView);
        this._textRedHeroCount.removeAllChildren();
        var richText = RichTextExtend.createRichTextByFormatString(Lang.get('season_squadredhero_count', {
            num1: 0,
            num2: 2
        }), {
            defaultColor: Colors.BRIGHT_BG_TWO,
            defaultSize: 20,
            other: { 1: { fontSize: 20 } }
        });
        richText.node.x = 0;
        richText.node.y = 6;
        this._textRedHeroCount.addChild(richText.node);
    }

    private _initListView(listView) {
        this._listView.setTemplate(this._seasonHeroIconPrefab);
        this._listView.setCallback(handler(this, this._onCellUpdate));
    }

    private _updateTemplate() {
        if (this._isInBanView && this._selectTabIndex == 5) {
            this._listView.setTemplate(this._seasonPet2IconPrefab);
        } else {
            this._listView.setTemplate(this._seasonHeroIconPrefab);
        }
    }

    private _onInitTab() {
        var param = {};
        if (this._isInBanView) {
            param = {
                callback: handler(this, this._onTabSelect),
                isVertical: 2,
                textList: [
                    Lang.get('handbook_country_tab1'),
                    Lang.get('handbook_country_tab2'),
                    Lang.get('handbook_country_tab3'),
                    Lang.get('handbook_country_tab4'),
                    Lang.get('season_pet_tab5')
                ]
            };
        } else {
            param = {
                callback: handler(this, this._onTabSelect),
                isVertical: 2,
                textList: [
                    Lang.get('handbook_country_tab1'),
                    Lang.get('handbook_country_tab2'),
                    Lang.get('handbook_country_tab3'),
                    Lang.get('handbook_country_tab4'),
                    Lang.get('season_country_tab5')
                ]
            };
        }
        this._nodeTabRoot.recreateTabs(param);
        this._nodeTabRoot.setTabIndex(this._selectTabIndex - 1);
    }

    private _onTabSelect(index, sender) {
        if (this._selectTabIndex == (index + 1)) {
            return;
        }
        this._selectTabIndex = (index + 1);
        this._updateTemplate();
        if (this._selectTabCallback) {
            this._selectTabCallback((index + 1));
        }
        this._updateListView((index + 1));
    }

    private _updateListView(index) {
        if (this._isInBanView) {
            this._updateForbitEffect();
        }
        if (this._heroListInfo == null || this._transformHeroInfo == null) {
            return;
        }
        var maxCount = 0;
        if (this._isInBanView) {
            maxCount = this._selectTabIndex == 5 ? (this._petListData).length : ObjKeyLength(this._heroListInfo[this._selectTabIndex]);
        } else {
            maxCount = this._selectTabIndex == 5 ? (this._transformHeroInfo).length : ObjKeyLength(this._heroListInfo[this._selectTabIndex]);
        }
        this._isEnoughSquadRedHeros = this._isEnoughRedHeros();
        this._isEnoughSquadGoldenHeros = this.isEnoughGoldenHeroes();
        this._isExistSquadTransHero = this._isExistTransformHeros();
        // var lineCount = Math.ceil(maxCount / 6);
        this._listView.resize(maxCount);
    }

    private _onCellUpdate(node: cc.Node, index) {
        if (this._heroListInfo == null || this._transformHeroInfo == null) {
            return;
        }
        if (this._isInBanView && this._petListData == null) {
            return;
        }
        var curData: any[] = [];
        let cell: SeasonHeroIcon | SeasonPet2Icon;
        if (this._isInBanView) {
            curData = this._selectTabIndex == 5 ? this._petListData : this._heroListInfo[this._selectTabIndex];
        } else {
            curData = this._selectTabIndex == 5 ? this._transformHeroInfo : this._heroListInfo[this._selectTabIndex];
        }
        cell = this._selectTabIndex == 5 && node.getComponent(SeasonPet2Icon) || node.getComponent(SeasonHeroIcon);
        if (!curData || curData.length <= 0) {
            return;
        }
        var cellData: any = {};
        if (this._isInBanView) {
            var itemData = curData[index];
            if (itemData && itemData.cfg != null) {
                cellData = itemData.cfg;
                if (this._selectTabIndex == 5) {
                    cellData.isSelected = index == this._curTouchIndex || false;
                    cellData.isShowTop = false;
                    cellData.isBaned = (this._banPetId == cellData.id);
                    cellData.isMask = (this._banPetId == cellData.id);
                    cellData.isInBanView = this._isInBanView;
                } else {
                    cellData.isSelected = index == this._curTouchIndex || false;
                    cellData.isShowTop = false;
                    cellData.isBaned = this._isExistBanedHero(cellData.id);
                    cellData.isMask = this._isExistBanedHero(cellData.id);
                    cellData.isInBanView = this._isInBanView;
                }
            }
        } else {
            var itemData = curData[index];
            if (itemData && itemData.cfg != null) {
                cellData = itemData.cfg;
                cellData.isBaned = this._isBanedHero(cellData.id);
                cellData.isInBanView = this._isInBanView;
                cellData.isSelected = index == this._curTouchIndex || false;
                if (this._isRedHero(cellData.id) && this._isEnoughSquadRedHeros) {
                    cellData.isMask = true;
                    cellData.isShowTop = this._isMaskInOwnHeros(cellData.id);
                } else if (this._isEnoughSquadGoldenHeros && this._isGoldenHero(cellData.id)) {
                    cellData.isMask = true;
                    cellData.isShowTop = this._isMaskInOwnHeros(cellData.id);
                }else if (this._selectTabIndex == 5) {
                    if (this._isExistSquadTransHero > 0) {
                        var heroId = SeasonSportHelper.getTransformCardsHeroId(cellData.id);
                        cellData.isMask = true;
                        cellData.isShowTop = this._isExistSquadTransHero == heroId || false;
                    } else {
                        var heroId = SeasonSportHelper.getTransformCardsHeroId(cellData.id);
                        cellData.isMask = this._isMaskInOwnHeros(heroId);
                        cellData.isShowTop = false;
                    }
                    if (this._isBanedHero(SeasonSportHelper.getTransformCardsHeroId(cellData.id))) {
                        cellData.isMask = true;
                        cellData.isBaned = true;
                    }
                    var heroId = SeasonSportHelper.getTransformCardsHeroId(cellData.id);
                    if (this._isEnoughSquadRedHeros && this._isRedHero(heroId)) {
                        cellData.isMask = true;
                        cellData.isShowTop = false;
                    }
                } else {
                    cellData.isMask = this._isMaskInOwnHeros(cellData.id);
                    cellData.isShowTop = this._isMaskInOwnHeros(cellData.id);
                }
            }
        }
        cell.setCustomCallback(handler(this, this._onItemTouch));
        cell.updateUI(this._selectTabIndex, cellData);
    }

    private _onCellSelected(cell, index) {
    }

    private _onItemTouch(itemPos) {
        if (this._touchCallback) {
            this._touchCallback(this._selectTabIndex, itemPos);
        }
        this._updateListView(this._selectTabIndex);
        if (!this._isInBanView) {
            if (this._closeCallBack) {
                this._closeCallBack();
            }
            this.close();
        }
    }

    public setCurOwnHeroData(data: any[]) {
        this._curOwnLockData = data;
        this._updateListView(this._selectTabIndex);
    }

    private _isMaskInOwnHeros(baseId) {
        var otherSideHeros: any[] = G_UserData.getSeasonSport().getOther_SquadInfo();
        if (otherSideHeros && otherSideHeros.length > 0) {
            for (let key in otherSideHeros) {
                var value = otherSideHeros[key];
                if (value > 0 && baseId == value) {
                    return true;
                }
            }
        }
        for (var index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            if (this._curOwnLockData[index - 1]) {
                var heroId = this._curOwnLockData[index - 1].heroId;
                if (this._selectTabIndex == 5) {
                    if (heroId > 0 && SeasonSportHelper.isHero(heroId) == false) {
                        return true;
                    }
                } else {
                    if (baseId == heroId) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isEnoughGoldenHeroes () {
        var ownSide = G_UserData.getSeasonSport().getOwn_SquadInfo();
        if (!ownSide || ownSide.length <= 0) {
            return false;
        }
        var goldenCount = 0;
        for (var key in ownSide) {
            var value = ownSide[key];
            for (var index = 1; index <= ObjKeyLength(this._goldenHeroListInfo); index++) {
                for (var indexj = 1; indexj <= this._goldenHeroListInfo[index].length; indexj++) {
                    if (this._goldenHeroListInfo[index][indexj -1] && value == this._goldenHeroListInfo[index][indexj -1].cfg.id) {
                        if (this._goldenHeroListInfo[index][indexj - 1].cfg.color == SeasonSportConst.HERO_SCOP_GOLDENLIMIT) {
                            goldenCount = goldenCount + 1;
                            break;
                        }
                    }
                }
            }
        }
        for (var i = 1; i <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; i++) {
            if (this._curOwnLockData[i - 1]) {
                var curOwnHeroId = parseInt(this._curOwnLockData[i -1].heroId);
                if (curOwnHeroId > 0 && this._curOwnLockData[i -1].isLock == false) {
                    for (var index = 1; index <= ObjKeyLength(this._goldenHeroListInfo); index++) {
                        for (var indexj = 1; indexj <= this._goldenHeroListInfo[index].length; indexj++) {
                            var goldenHeroId = parseInt(this._goldenHeroListInfo[index][indexj - 1].cfg.id);
                            var color = parseInt(this._goldenHeroListInfo[index][indexj - 1].cfg.color);
                            if (curOwnHeroId == goldenHeroId && color == SeasonSportConst.HERO_SCOP_GOLDENLIMIT) {
                                goldenCount = goldenCount + 1;
                                break;
                            }
                        }
                    }
                }
            }
        }
        var maxLimit = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_MAXLIMIT_GOLDENHERO).content);
        if (this._canShowGoldenHero) {
            this._textGoldenHeroCount.removeAllChildren();
            var richText = RichTextExtend.createRichTextByFormatString(Lang.get('season_squadredhero_count', {
                num1: goldenCount,
                num2: maxLimit
            }), {
                defaultColor: Colors.BRIGHT_BG_TWO,
                defaultSize: 20,
                other: { [1]: { fontSize: 20 } }
            });
            richText.node.x =(0);
            richText.node.y = (6);
            this._textGoldenHeroCount.addChild(richText.node);
        }
        if (maxLimit <= goldenCount) {
            return true;
        }
        return false;
    }

    private _isEnoughRedHeros() {
        var ownSide = G_UserData.getSeasonSport().getOwn_SquadInfo();
        if (!ownSide || ownSide.length <= 0) {
            return false;
        }
        var redCount = 0;
        for (let key in ownSide) {
            var value = ownSide[key];
            for (let index = 1; index <= ObjKeyLength(this._redHeroListInfo); index++) {
                for (let indexj = 1; indexj <= this._redHeroListInfo[index].length; indexj++) {
                    if (this._redHeroListInfo[index][indexj - 1] && value == this._redHeroListInfo[index][indexj - 1].cfg.id) {
                        if (this._redHeroListInfo[index][indexj - 1].cfg.color == SeasonSportConst.HERO_SCOP_REDIMIT) {
                            redCount = redCount + 1;
                            break;
                        }
                    }
                }
            }
        }
        for (let i = 1; i <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; i++) {
            if (this._curOwnLockData[i - 1]) {
                let curOwnHeroId = parseInt(this._curOwnLockData[i - 1].heroId);
                if (this._curOwnLockData[i - 1].state == 1) {
                    curOwnHeroId = SeasonSportHelper.getTransformCardsHeroId(curOwnHeroId);
                }
                if (curOwnHeroId > 0 && this._curOwnLockData[i - 1].isLock == false) {
                    for (let index = 1; index <= ObjKeyLength(this._redHeroListInfo); index++) {
                        for (let indexj = 1; indexj <= this._redHeroListInfo[index].length; indexj++) {
                            var redHeroId = parseInt(this._redHeroListInfo[index][indexj - 1].cfg.id);
                            var color = parseInt(this._redHeroListInfo[index][indexj - 1].cfg.color);
                            if (curOwnHeroId == redHeroId && color == SeasonSportConst.HERO_SCOP_REDIMIT) {
                                redCount = redCount + 1;
                                break;
                            }
                        }
                    }
                }
            }
        }
        var maxLimit = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_MAXLIMIT_REDHERO).content);
        this._textRedHeroCount.removeAllChildren();
        var richText = RichTextExtend.createRichTextByFormatString(Lang.get('season_squadredhero_count', {
            num1: redCount,
            num2: maxLimit
        }), {
            defaultColor: Colors.BRIGHT_BG_TWO,
            defaultSize: 20,
            other: { 1: { fontSize: 20 } }
        });
        richText.node.x = 0;
        richText.node.y = 6;
        this._textRedHeroCount.addChild(richText.node);
        if (maxLimit <= redCount) {
            return true;
        }
        return false;
    }

    private _isExistTransformHeros() {
        for (var index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            if (this._curOwnLockData[index - 1]) {
                var heroId = this._curOwnLockData[index - 1].heroId;
                if (heroId > 0 && this._selectTabIndex == 5) {
                    if (SeasonSportHelper.isHero(heroId) == false) {
                        heroId = SeasonSportHelper.getTransformCardsHeroId(heroId);
                        return heroId;
                    }
                }
            }
        }
        return 0;
    }

    private _isExistBanedHero(heroId) {
        var maxBanHeroNum = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content);
        for (var index = 1; index <= maxBanHeroNum; index++) {
            if (this._banHeroData[index - 1] && this._banHeroData[index - 1].heroId == heroId) {
                return true;
            }
        }
        return false;
    }

    private _isBanedHero(heroId) {
        var banedData = G_UserData.getSeasonSport().getBanHeros();
        if (banedData == null || banedData.length <= 0) {
            return false;
        }
        for (var index = 1; index <= banedData.length; index++) {
            if (banedData[index - 1] && banedData[index - 1] == heroId) {
                return true;
            }
        }
        return false;
    }

    private _isBanedPets(petId) {
        var banedData = G_UserData.getSeasonSport().getBanPets();
        if (banedData == null || banedData.length <= 0) {
            return false;
        }
        for (var index = 1; index <= banedData.length; index++) {
            if (banedData[index - 1] && banedData[index - 1] == petId) {
                return true;
            }
        }
        return false;
    }

    private _isRedHero(heroId) {
        for (var index = 1; index <= ObjKeyLength(this._redHeroListInfo); index++) {
            for (var indexj = 1; indexj <= this._redHeroListInfo[index].length; indexj++) {
                if (this._redHeroListInfo[index][indexj - 1] && heroId == this._redHeroListInfo[index][indexj - 1].cfg.id) {
                    if (this._redHeroListInfo[index][indexj - 1].cfg.color == SeasonSportConst.HERO_SCOP_REDIMIT) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    _isGoldenHero(heroId) {
        for (var k in this._goldenHeroListInfo) {
            var v = this._goldenHeroListInfo[k];
            for (var ii in v) {
                var vv = v[ii];
                if (vv.cfg.id == heroId && vv.cfg.color == SeasonSportConst.HERO_SCOP_GOLDENLIMIT) {
                    return true;
                }
            }
        }
        return false;
    }
}