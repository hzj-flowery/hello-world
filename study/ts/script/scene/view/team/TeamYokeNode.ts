const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors, G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import ScrollViewExtra from '../../../ui/component/ScrollViewExtra';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import TeamPartnerIcon from './TeamPartnerIcon';
import TeamYokeAvatarNode from './TeamYokeAvatarNode';
import TeamYokeDynamicModule from './TeamYokeDynamicModule';


// import ScrollViewExtra from '../../../ui/component/ScrollViewExtra';

@ccclass
export default class TeamYokeNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDetailName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelOverview: cc.Node = null;

    @property({
        type: TeamYokeAvatarNode,
        visible: true
    })
    _fileNodeAvatar1: TeamYokeAvatarNode = null;

    @property({
        type: TeamYokeAvatarNode,
        visible: true
    })
    _fileNodeAvatar2: TeamYokeAvatarNode = null;

    @property({
        type: TeamYokeAvatarNode,
        visible: true
    })
    _fileNodeAvatar3: TeamYokeAvatarNode = null;

    @property({
        type: TeamYokeAvatarNode,
        visible: true
    })
    _fileNodeAvatar4: TeamYokeAvatarNode = null;

    @property({
        type: TeamYokeAvatarNode,
        visible: true
    })
    _fileNodeAvatar5: TeamYokeAvatarNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTotalCountBg: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonPlus: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDetail: cc.Node = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonReturn: CommonButtonLevel0Highlight = null;

    @property({
        type: TeamPartnerIcon,
        visible: true
    })
    _fileNodePartner1: TeamPartnerIcon = null;

    @property({
        type: TeamPartnerIcon,
        visible: true
    })
    _fileNodePartner2: TeamPartnerIcon = null;

    @property({
        type: TeamPartnerIcon,
        visible: true
    })
    _fileNodePartner3: TeamPartnerIcon = null;

    @property({
        type: TeamPartnerIcon,
        visible: true
    })
    _fileNodePartner4: TeamPartnerIcon = null;

    @property({
        type: TeamPartnerIcon,
        visible: true
    })
    _fileNodePartner5: TeamPartnerIcon = null;

    @property({
        type: TeamPartnerIcon,
        visible: true
    })
    _fileNodePartner6: TeamPartnerIcon = null;

    @property({
        type: TeamPartnerIcon,
        visible: true
    })
    _fileNodePartner7: TeamPartnerIcon = null;

    @property({
        type: TeamPartnerIcon,
        visible: true
    })
    _fileNodePartner8: TeamPartnerIcon = null;

    private _signalChangeHeroSecondFormation: any;
    private _signalRedPointUpdate: any;
    private _heroDatas: any;
    private _panelIndex: number;

    //需要实例化
    private _commonDetailNewTitleWithBg;
    private _teamYokeDynamicModule;

    private _parentView:any;

    public setInitData(pv:any):void{
        this._parentView = pv;
    }

    onCreate() {
        this._commonDetailNewTitleWithBg = cc.resources.get(Path.getCommonPrefab("CommonDetailNewTitleWithBg"));
        this._teamYokeDynamicModule = cc.resources.get(Path.getPrefab("TeamYokeDynamicModule","team"));
        this._panelIndex = 1;
        this._heroDatas = {};
        for (var i = 1; i <= 8; i++) {
            (this['_fileNodePartner' + i] as TeamPartnerIcon).setInitData(i);
        }
        this._buttonPlus._text.string = (Lang.get('hero_yoke_btn_plus'));
        this._buttonReturn._text.string = (Lang.get('hero_yoke_btn_return'));
        this._listView.node.addComponent(ScrollViewExtra);
    }
    onEnter() {
        this._signalChangeHeroSecondFormation = G_SignalManager.add(SignalConst.EVENT_CHANGE_HERO_SECOND_FORMATION, handler(this, this._changeHeroSecondFormation));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
    }
    onExit() {
        this._signalChangeHeroSecondFormation.remove();
        this._signalChangeHeroSecondFormation = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
    }
    updatePartnerIcon(secondHeroDatas) {
        var partnerInfo = HeroDataHelper.getPartnersInfo(secondHeroDatas);
        for (var i = 1; i <= 8; i++) {
            var info = partnerInfo[i];
            (this['_fileNodePartner' + i] as TeamPartnerIcon).updateView(info);
        }
    }
    _updateTotalCount() {
        var count = HeroDataHelper.getActivatedYokeTotalCount(this._heroDatas);
        var desContent = Lang.get('hero_yoke_activated_total_count', { count: count });

        let richText = RichTextExtend.createWithContent(desContent);
        richText.node.color = new cc.Color(255,255,255,255);
        var size = this._panelTotalCountBg.getContentSize();
        this._panelTotalCountBg.removeAllChildren();
        this._panelTotalCountBg.addChild(richText.node);
    }
    _updateListView() {
        this._listView.content.removeAllChildren();
        var allInfo = HeroDataHelper.getYokeDetailInfo(this._heroDatas);
        for (var i =allInfo.length-1;i>=0;i--) {
            var info = allInfo[i];
            var module1 = (cc.instantiate(this._teamYokeDynamicModule) as cc.Node).getComponent(TeamYokeDynamicModule) as TeamYokeDynamicModule;
            module1.setInitData();
            module1.updateViewExtra(info.yokeInfo,info.heroBaseId);
            UIHelper.updateCurstomListSize(this._listView.content,module1.node);
        }
        this._listView.scrollToTop();
    }
    _updateAvatar() {
        var infos = HeroDataHelper.getYokeOverviewInfo(this._heroDatas);
        for (var i = 1; i <= 5; i++) {
            var info = infos[i-1];
            if (info) {
                (this['_fileNodeAvatar' + i] as TeamYokeAvatarNode).node.active = (true);
                (this['_fileNodeAvatar' + i] as TeamYokeAvatarNode).updateView(info.baseId, info.activatedCount, info.totalCount, info.limitLevel, info.limitRedLevel);
            } else {
                (this['_fileNodeAvatar' + i] as TeamYokeAvatarNode).node.active = (false);
            }
        }
    }
    onButtonPlus() {
        this._panelIndex = 2;
        this.updatePanel();
    }
    onButtonReturn() {
        this._panelIndex = 1;
        this.updatePanel();
    }
    updatePanel(heroDatas?) {
        if (heroDatas) {
            this._heroDatas = heroDatas;
        }
        if (this._panelIndex == 1) {
            this._panelOverview.active = (true);
            this._panelDetail.active = (false);
            this._updateTotalCount();
            this._updateAvatar();
        } else {
            this._panelOverview.active = (false);
            this._panelDetail.active = (true);
            this._updateListView();
        }
    }
    _showRedPoint(visible) {
        var secondHeroDatas = G_UserData.getTeam().getHeroDataInReinforcements();
        var partnerInfo = HeroDataHelper.getPartnersInfo(secondHeroDatas);
        for (var i = 1;i<=8;i++) {
            var info = partnerInfo[i];
            if (!info.lock && info.heroData == null) {
                (this['_fileNodePartner' + i] as TeamPartnerIcon).showRedPoint(visible);
                return;
            }
        }
    }
    _onEventRedPointUpdate(eventName, funcId) {
        this.checkReinforcementPosRP(funcId);
    }
    checkReinforcementPosRP(funcId) {
        if (funcId && funcId == FunctionConst.FUNC_TEAM) {
            var reach = RedPointHelper.isModuleSubReach(funcId, 'reinforcementPosRP');
            this._showRedPoint(reach);
        }
    }
    _changeHeroSecondFormation(eventName, heroId, oldHeroId) {
        var secondHeroDatas = G_UserData.getTeam().getHeroDataInReinforcements();
        var heroDatas = G_UserData.getTeam().getHeroDataInBattle();
        this.updatePartnerIcon(secondHeroDatas);
        this.updatePanel(heroDatas);
        G_UserData.getAttr().recordPower();
        this._playChangeSecondHeroSummary(heroId, oldHeroId);
    }
    _playChangeSecondHeroSummary(heroId, oldHeroId) {
        var summary = [];
        var successStr = Lang.get('summary_second_hero_inbattle');
        if (oldHeroId && oldHeroId > 0) {
            successStr = Lang.get('summary_second_hero_change');
        }
        var param1 = {
            content: successStr,
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_YOKE/2 }
        };
        summary.push(param1);
        if (heroId && heroId > 0) {
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var heroBaseId = heroUnitData.getBase_id();
            var [count, info] = HeroDataHelper.getWillActivateYokeCount(heroBaseId, null, true, true);
            if (info) {
                for (var i in info) {
                    var one = info[i];
                    var heroParam = one.heroParam;
                    var content = Lang.get('summary_yoke_active', {
                        heroName: heroParam.name,
                        colorHero: Colors.colorToNumber(heroParam.icon_color),
                        outlineHero: Colors.colorToNumber(heroParam.icon_color_outline),
                        yokeName: one.yokeName
                    });
                    var param = {
                        content: content,
                        startPosition: { x: UIConst.SUMMARY_OFFSET_X_YOKE/2 }
                    };
                    summary.push(param);
                }
            }
        }
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_YOKE, -5);
    }

}