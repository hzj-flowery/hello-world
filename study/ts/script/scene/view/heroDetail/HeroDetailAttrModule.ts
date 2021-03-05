const { ccclass, property } = cc._decorator;

import AttributeConst from '../../../const/AttributeConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { HeroConst } from '../../../const/HeroConst';
import { HeroUnitData } from '../../../data/HeroUnitData';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { G_ConfigLoader, G_Prompt, G_SceneManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrNode from '../../../ui/component/CommonAttrNode';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal';
import CommonDesValue from '../../../ui/component/CommonDesValue';
import { CommonDetailModule } from '../../../ui/component/CommonDetailModule';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { handler } from '../../../utils/handler';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import HeroGoldHelper from '../heroGoldTrain/HeroGoldHelper';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';




@ccclass
export default class HeroDetailAttrModule extends ListViewCellBase implements CommonDetailModule {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTop: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeLevel: CommonDesValue = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr4: CommonAttrNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBottom: cc.Node = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr6: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr7: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr8: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr9: CommonAttrNode = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonUpgrade: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonBreak: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonAwake: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonLimit: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonGold: CommonButtonLevel1Highlight = null;

    constructor() {
        super();
    }
    private _isPure: boolean;
    private _heroUnitData: HeroUnitData;
    private _rangeType: number;
    //添加该脚本务必调用该函数
    setInitData(heroUnitData: HeroUnitData, rangeType: number,isPure:boolean = false): void {
        this._heroUnitData = heroUnitData;
        this._rangeType = rangeType;
        this._isPure = isPure;
    }

    public numberOfCell(): number {
        return 1;
    }

    public cellAtIndex(i: number): cc.Node {
        this.node.name = "HeroDetailAttrModule";
        this._nodeTitle._textTitle.fontSize = (24);
        this._nodeTitle.setTitle(Lang.get('hero_detail_title_attr'));
        this._nodeLevel.setFontSize(20);
        this._buttonGold._text.string = (Lang.get('goldenhero_train_button_text'));
        this._buttonUpgrade._text.string = (Lang.get('hero_detail_btn_upgrade'));
        this._buttonBreak._text.string = (Lang.get('hero_detail_btn_break'));
        this._buttonAwake._text.string = (Lang.get('hero_detail_btn_awake'));
        this._buttonLimit._text.string = (Lang.get('hero_detail_btn_limit'));
        this._nodeBottom.active = (false);
        this.updateData(this._heroUnitData);
        this._doLayout();
        this._buttonAwake.addClickEventListenerEx(handler(this,this.onButtonAwakeClicked));
        this._buttonBreak.addClickEventListenerEx(handler(this,this.onButtonBreakClicked));
        this._buttonGold.addClickEventListenerEx(handler(this,this.onButtonGoldClicked));
        this._buttonLimit.addClickEventListenerEx(handler(this,this.onButtonLimitClicked));
        this._buttonUpgrade.addClickEventListenerEx(handler(this,this.onButtonUpgradeClicked));
        
        return this.node;
    }

    updateData(heroUnitData) {
        var level = heroUnitData.getLevel();
        var maxLevel = G_UserData.getBase().getLevel();
        var param = { heroUnitData: heroUnitData };
        var attrInfo = HeroDataHelper.getTotalAttr(param);
        var rank = heroUnitData.getRank_lv();
        if (heroUnitData.isPureGoldHero()) {
            this._nodeLevel.updateUI(Lang.get('goldenhero_train_des_new'), rank, rank);
            this._nodeLevel.setMaxValue('');
        } else {
            this._nodeLevel.updateUI(Lang.get('team_detail_des_level_new'), level, maxLevel, 10);
            this._nodeLevel.setMaxValue('/' + maxLevel);
        }
        this._nodeAttr1.updateView(AttributeConst.ATK, attrInfo[AttributeConst.ATK], 10, 4);
        this._nodeAttr2.updateView(AttributeConst.HP, attrInfo[AttributeConst.HP], 10, 4);
        this._nodeAttr3.updateView(AttributeConst.PD, attrInfo[AttributeConst.PD], 10, 4);
        this._nodeAttr4.updateView(AttributeConst.MD, attrInfo[AttributeConst.MD], 10, 4);
        this.checkUpgradeRedPoint(heroUnitData);
        this.checkBreakRedPoint(heroUnitData);
        this.checkAwakeRedPoint(heroUnitData);
        this.checkLimitRedPoint(heroUnitData);
        this.checkGoldRankRedPoint(heroUnitData);
    }
    onButtonUpgradeClicked() {
        var [isOpen, des] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE1);
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        var heroId = this._heroUnitData.getId();
        G_SceneManager.showScene('heroTrain', heroId, HeroConst.HERO_TRAIN_UPGRADE, this._rangeType, true);
    }
    onButtonBreakClicked() {
        var [isOpen, des] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE2);
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        var heroId = this._heroUnitData.getId();
        G_SceneManager.showScene('heroTrain', heroId, HeroConst.HERO_TRAIN_BREAK, this._rangeType, true);
    }
    onButtonAwakeClicked() {
        var [isOpen, des] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE3);
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        var heroId = this._heroUnitData.getId();
        G_SceneManager.showScene('heroTrain', heroId, HeroConst.HERO_TRAIN_AWAKE, this._rangeType, true);
    }
    onButtonLimitClicked() {
        var [isOpen, des] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE4);
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        var heroId = this._heroUnitData.getId();
        G_SceneManager.showScene('heroTrain', heroId, HeroConst.HERO_TRAIN_LIMIT, this._rangeType, true);
    }
    private onButtonGoldClicked() {
        var heroId = this._heroUnitData.getId();
        G_SceneManager.showScene('heroGoldTrain', heroId);
    }
    private checkUpgradeRedPoint(heroUnitData) {
        if (heroUnitData.getConfig().type != 1) {
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE1, heroUnitData);
            this._buttonUpgrade.showRedPoint(reach);
        }
    }
    private checkBreakRedPoint(heroUnitData) {
        var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE2, heroUnitData);
        this._buttonBreak.showRedPoint(reach);
    }
    private checkAwakeRedPoint(heroUnitData) {
        var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE3, heroUnitData);
        this._buttonAwake.showRedPoint(reach);
    }
    private checkLimitRedPoint(heroUnitData) {
        var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE4, heroUnitData);
        this._buttonLimit.showRedPoint(reach);
    }
    private checkGoldRankRedPoint(heroUnitData) {
        var reach = HeroGoldHelper.heroGoldNeedRedPoint(heroUnitData);
        this._buttonGold.showRedPoint(reach[0]);
    }
    _doLayout() {
        if (this._isPure) {
            this._pureLayout();
        } else {
            this._normalLayout();
        }
        var contentSize = this._panelBg.getContentSize();
        this.node.setContentSize(contentSize);
    }
    _normalLayout() {
        var isGold = HeroGoldHelper.isPureHeroGold(this._heroUnitData);
        this._buttonGold.node.active = (isGold);
        this._buttonGold.node.y = (37);
        var showUpgrade = this._heroUnitData.getConfig().type != 1 && !isGold;
        this._buttonUpgrade.node.active = (showUpgrade);
        var showBreak = this._heroUnitData.isCanBreak() && !isGold;
        this._buttonBreak.node.active = (showBreak);
        var canAwake = this._heroUnitData.isCanAwake() && !isGold;
        var awakeIsOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE3)[0];
        var showAwake = canAwake && awakeIsOpen;
        this._buttonAwake.node.active = (showAwake);
        var [canLimit, limitType] = this._heroUnitData.isCanLimitBreak();
        canLimit = canLimit && !isGold;
        var funcLimitType = FunctionConst.FUNC_HERO_TRAIN_TYPE4;
        var funcLimitType2 = funcLimitType;
        if (limitType == HeroConst.HERO_LIMIT_TYPE_GOLD) {
            funcLimitType = FunctionConst.FUNC_HERO_TRAIN_TYPE4_RED;
        }
        var [limitIsOpen] = LogicCheckHelper.funcIsOpened(funcLimitType);
        var showLimit = canLimit && limitIsOpen;
        this._buttonLimit.node.active = (showLimit);
        var dynamicBtns = [];
        var showCount = 0;
        if (showUpgrade) {
            showCount = showCount + 1;
        }
        if (showBreak) {
            showCount = showCount + 1;
        }
        //觉醒
        if (showAwake) {
            showCount = showCount + 1;
            var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_HERO_TRAIN_TYPE3);
          //assert((funcLevelInfo, 'Invalid function_level can not find funcId ' + FunctionConst.FUNC_HERO_TRAIN_TYPE3);
            dynamicBtns.push({
                btn: this._buttonAwake,
                displayOpenLevel: funcLevelInfo.level,
                openLevel: funcLevelInfo.level
            });
        }
        //界限
        if (showLimit) {
            showCount = showCount + 1;
            var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(funcLimitType);
            var funcLevelInfo2 = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(funcLimitType2);
            dynamicBtns.push({
                btn: this._buttonLimit,
                displayOpenLevel: funcLevelInfo2.level,
                openLevel: funcLevelInfo.level
            });
        }
        dynamicBtns.sort(function (a, b):number {
            return parseInt(a.displayOpenLevel) - parseInt(b.displayOpenLevel);
        });
        if (showCount > 3) {
            this._panelBg.setContentSize(cc.size(402, 284));
            this._nodeTitle.node.y = (262);
            this._nodeLevel.node.y = (213);
            this._nodeAttr1.node.y = (182);
            this._nodeAttr2.node.y = (182);
            this._nodeAttr3.node.y = (153);
            this._nodeAttr4.node.y = (153);
            this._buttonUpgrade.node.y = (95);
            this._buttonBreak.node.y = (95);
            if (dynamicBtns[0]) {
                dynamicBtns[0].btn.node.setPosition(new cc.Vec2(330, 95));
            }
            if (dynamicBtns[1]) {
                dynamicBtns[1].btn.node.setPosition(new cc.Vec2(70, 37));
            }
        } else {
            this._panelBg.setContentSize(cc.size(402, 226));
            this._nodeTitle.node.y = (204);
            this._nodeLevel.node.y = (155);
            this._nodeAttr1.node.y = (124);
            this._nodeAttr2.node.y = (124);
            this._nodeAttr3.node.y = (95);
            this._nodeAttr4.node.y = (95);
            this._buttonUpgrade.node.y = (37);
            this._buttonBreak.node.y = (37);
            if (dynamicBtns[0]) {
                dynamicBtns[0].btn.node.setPosition(new cc.Vec2(330, 37));
            }
        }
    }
    
    showAttrBottom(attr) {
        var offsetY = 80;
        var size = this._panelBg.getContentSize();
        size.height = size.height + offsetY;
        this._panelBg.setContentSize(size);
        this._nodeBottom.active = (true);
        this._nodeTop.y = (this._nodeTop.y + offsetY);
        this._nodeBottom.y = (this._nodeBottom.y - 100);
        this._nodeAttr6.updateView(AttributeConst.ATK_PER, attr[AttributeConst.ATK_PER], null, 4);
        this._nodeAttr7.updateView(AttributeConst.PD_PER, attr[AttributeConst.PD_PER], null, 4);
        this._nodeAttr8.updateView(AttributeConst.MD_PER, attr[AttributeConst.MD_PER], null, 4);
        this._nodeAttr9.updateView(AttributeConst.HP_PER, attr[AttributeConst.HP_PER], null, 4);
    }
    reUpdateAttr(attrInfo) {
        this._nodeAttr1.updateView(AttributeConst.ATK, attrInfo[AttributeConst.ATK], null, 4);
        this._nodeAttr2.updateView(AttributeConst.HP, attrInfo[AttributeConst.HP], null, 4);
        this._nodeAttr3.updateView(AttributeConst.PD, attrInfo[AttributeConst.PD], null, 4);
        this._nodeAttr4.updateView(AttributeConst.MD, attrInfo[AttributeConst.MD], null, 4);
    }
    _pureLayout() {
        this._buttonGold.node.active = (false);
        this._buttonUpgrade.node.active = (false);
        this._buttonBreak.node.active = (false);
        this._buttonAwake.node.active = (false);
        this._buttonLimit.node.active = (false);
        this._nodeTitle.node.y = (134);
        this._nodeLevel.node.y = (92);
        this._nodeAttr1.node.y = (61);
        this._nodeAttr2.node.y = (61);
        this._nodeAttr3.node.y = (32);
        this._nodeAttr4.node.y = (32);
        this._panelBg.setContentSize(cc.size(402, 156));
    }
    getPanelSize() {
        return this._panelBg.getContentSize();
    }
}