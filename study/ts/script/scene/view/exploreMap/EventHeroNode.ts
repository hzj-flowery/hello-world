const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { ExploreConst } from '../../../const/ExploreConst';
import { ExploreEventData } from '../../../data/ExploreEventData';
import { Colors, G_ConfigLoader, G_Prompt, G_ServerTime, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonIconTemplate from '../../../ui/component/CommonIconTemplate';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import { Color } from '../../../utils/Color';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { handler } from '../../../utils/handler';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { Util } from '../../../utils/Util';

@ccclass
export default class EventHeroNode extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _country: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _countDownNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _leftTimeLabel: cc.Label = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _yuanPanel1: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textYuanTitle: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _yuanPanel2: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _iconHero: CommonIconTemplate = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _heroDesScrollView: cc.ScrollView = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnBuy: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _priceInfo: CommonResourceInfo = null;

    private _eventData: ExploreEventData;
    private _configData;
    private _heroData;
    private _heroResData;
    private _tableData;
    private _price;
    private _yuanPanels: cc.Node[];
    private _titleStartPosY;

    private _textHeroNameOutLine: cc.LabelOutline;

    setUp(eventData) {
        this._eventData = eventData;
        this._configData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_DISCOVER).get(eventData.getEvent_type());
        var heroId = eventData.getValue2();
        this._heroData = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroId);
        this._heroResData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(this._heroData.res_id);
        this._tableData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_HERO).get(eventData.getValue1());

        this._price = {};
        this._textHeroNameOutLine = UIHelper.enableOutline(this._textHeroName, null, 1);
        this._textHeroNameOutLine.width = 1;
        this._yuanPanel1.active = false;;
        this._yuanPanel2.active = false;;
        this._heroDesScrollView.node.active = false;;
        this._yuanPanels = [
            this._yuanPanel1,
            this._yuanPanel2
        ];
        this._setTalk();
        this._refreshBtn();
        this._refreshYuan();
        this._titleStartPosY = this._textYuanTitle.node.getPosition().y;
        this._leftTimeLabel.string = G_ServerTime.getLeftSecondsString(this._eventData.getEndTime(), '00:00:00');

        // var heroData = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, this._heroData.id);
        // if(heroData.country_text != null){
        //     this.countryPath = heroData.country_text;
        //     cc.resources.load(this.countryPath, this.onLoadCountry.bind(this));
        // }
        this._heroAvatar.init();
        this._refreshHeroInfo();
        this.schedule(handler(this, this._onTimer), 0.5, cc.macro.REPEAT_FOREVER);
    }

    // private countryPath: string;
    // private onLoadCountry(err, resource): void{
    //     this._country.spriteFrame.setTexture(this.countryPath);
    // }
    onDestroy() {
        console.log('eventheronode ondestroy...');
        this.unschedule(this._onTimer);
    }
    _setTalk() { }
    _refreshHeroInfo() {
        this._heroAvatar.updateUI(this._heroData.id, null, false, 0);
        var heroData = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, this._heroData.id);
        UIHelper.loadTexture(this._country, heroData.country_text);
        //  this._country.spriteFrame.setTexture(heroData.country_text);
        var heroColor = this._heroData.color;
        for (var i = 0; i <= 2; i++) {
            if (this._tableData['hero' + (i + '_color')] == heroColor) {
                this._price = {
                    type: this._tableData['hero' + (i + '_type')],
                    value: this._tableData['hero' + (i + '_resource')],
                    size: this._tableData['hero' + (i + '_size')]
                };
                this._priceInfo.updateUI(this._price.type, this._price.value, this._price.size);
            }
        }
        this._priceInfo.onLoad();
        this._priceInfo.showResName(true, Lang.get('explore_get_hero_cost'));
        this._priceInfo.setResNameFontSize(ExploreConst.COST_NAME_SIZE);
        this._priceInfo.setTextColorToDTypeColor(null);
        this._priceInfo.setResNameColor(ExploreConst.COST_NAME_COLOR);
        this._iconHero.initUI(TypeConvertHelper.TYPE_HERO, this._heroData.id, 1);
        this._iconHero.setTouchEnabled(true);
        this._textHeroName.string = this._heroData.name;
        this._textHeroName.node.color = Color.getColor(heroColor);
        this._textHeroNameOutLine.color = Color.getColorOutline(heroColor);
    }
    //刷新按钮
    _refreshBtn() {
        var param = this._eventData.getParam();
        if (param == 0) {
            this._btnBuy.setString(Lang.get('explore_get_hero'));
        } else {
            this._btnBuy.setEnabled(false);
            this._btnBuy.setString(Lang.get('explore_got_hero'));
        }
    }
    //判断是否就差该武将 即可激活缘分
    _isCanActiveKarma(herosID, curHeroID) {
        // assert(type(herosID) == 'table', 'herosID is not table');
        for (var key in herosID) {
            var v = herosID[key];
            if (v != curHeroID) {
                if (!G_UserData.getKarma().isHaveHero(v)) {
                    return false;
                }
            }
        }
        return true;
    }
    _showHeroDes() {
        this._heroDesScrollView.node.active = true;
        var labelNode: cc.Node = UIHelper.createLabel({
            text: this._heroData.description || '',
            fontSize: 18,
            color: Colors.DARK_BG_ONE
        });
        var label:cc.Label = labelNode.getComponent(cc.Label);
        labelNode.setAnchorPoint(0, 1);
        // var render = label.getVirtualRenderer();
        // render.setWidth(this._heroDesScrollView.getContentSize().width);
        // render.setLineSpacing(3);
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.lineHeight = 21;
        labelNode.width = this._heroDesScrollView.content.width;
        label["_updateRenderData"](true);
        this._heroDesScrollView.content.addChild(labelNode);
        this._heroDesScrollView.content.setContentSize(labelNode.getContentSize());
    }
    //刷新缘分
    _refreshYuan() {
        var yuanTbl = HeroDataHelper.getActivateKarmaInfoWithHeroBaseId(this._heroData.id);
        var isActiveKarma = yuanTbl.length != 0;
        if (isActiveKarma) {
            var isCanActivate = false;
            for (var _ in yuanTbl) {
                var v = yuanTbl[_];
                if (this._isCanActiveKarma(v.karmaData.heroIds, this._heroData.id)) {
                    isCanActivate = true;
                    break;
                }
            }
            if (!isCanActivate) {
                this._textYuanTitle.string = Lang.get('explore_hero_karma');
            } else {
                this._textYuanTitle.string = Lang.get('explore_hero_karma2');
            }
        } else {
            var isInBattle = G_UserData.getTeam().isInBattleWithBaseId(this._heroData.id);
            if (isInBattle) {
                this._textYuanTitle.string = Lang.get('explore_hero_break');
                this._showHeroDes();
            } else {
                this._textYuanTitle.string = Lang.get('explore_hero_des');
                this._showHeroDes();
            }
        }
        for (var i = 0; i < 2; i++) {
            if (yuanTbl[i]) {
                var textName = this._yuanPanels[i].getChildByName('_textName').getComponent(cc.Label);
                var textYuanTitle = this._yuanPanels[i].getChildByName('_textYuanTitle').getComponent(cc.Label);
                var textYuanContent = this._yuanPanels[i].getChildByName('_textYuanContent').getComponent(cc.Label);
                var karmaData = yuanTbl[i].karmaData;
                var mainHeroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(yuanTbl[i].heroId);
                textName.string = (mainHeroConfig.name);
                textName.node.color = (Color.getColor(mainHeroConfig.color));
                this._setLabelOutLine(textName, Color.getColorOutline(mainHeroConfig.color), 2);
                Util.updatelabelRenderData(textName);
                var nameWidth = textName.node.width;
                textYuanTitle.node.x = nameWidth + 10;
                textYuanTitle.string = karmaData.karmaName;
                Util.updatelabelRenderData(textYuanTitle);
                nameWidth = nameWidth + textYuanTitle.node.width + 10;
                textYuanContent.node.x = (nameWidth + 10);
                textYuanContent.string = karmaData.attrName + ('+' + (karmaData.attrValue + '%'));
                this._yuanPanels[i].active = true;
            }
        }
    }
    //点击购买
    onBuyClick() {
        var endTime = this._eventData.getEndTime();
        var curTime = G_ServerTime.getTime();
        if (curTime > endTime) {
            G_Prompt.showTip(Lang.get('explore_event_time_over'));
            return;
        }
        var success = UserCheck.enoughValue(this._price.type, this._price.value, this._price.size);
        if (success) {
            G_UserData.getExplore().c2sExploreDoEvent(this._eventData.getEvent_id());
        }
    }
    //处理事件
    doEvent() {
        G_UserData.getExplore().setEventParamById(this._eventData.getEvent_id(), 1);
        this._refreshBtn();
    }
    _onTimer() {
        this._leftTimeLabel.string = G_ServerTime.getLeftSecondsString(this._eventData.getEndTime(), '00:00:00');
    }
    _setLabelOutLine(label: cc.Label, color, width) {
        UIHelper.enableOutline(label,color,width);
    }

}