import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import TeamPartnerIcon from "./TeamPartnerIcon";
import TeamYokeAvatarNode from "./TeamYokeAvatarNode";
import TeamYokeDynamicModule from "./TeamYokeDynamicModule";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UserYokeNode extends ViewBase{

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
    private _panelIndex: number;

    //需要实例化
    private _commonDetailTitleWithBg;
    private _teamYokeDynamicModule;

    private _parentView:any;

    private _detailData:any;


    public setInitData(pv:any):void{
        this._parentView = pv;
    }

    onCreate() {
        this._commonDetailTitleWithBg = cc.resources.get(Path.getCommonPrefab("CommonDetailTitleWithBg"));
        this._teamYokeDynamicModule = cc.resources.get(Path.getPrefab("TeamYokeDynamicModule","team"))
        this._panelIndex = 1;
        this.node.setScale(0.84);
        // this._panelBase.y = (375);
        // this._panelOverview.y = (220);
        this._panelBg.active = (false);
        this._imageBg.node.active = (false);
        for (var i = 1; i <= 8; i++) {
            (this['_fileNodePartner' + i] as TeamPartnerIcon).setInitData(i);
        }
        this._buttonPlus.setString(Lang.get('hero_yoke_btn_plus'));
        this._buttonReturn.setString(Lang.get('hero_yoke_btn_return'));
        this._buttonPlus.addClickEventListenerEx(handler(this,this.onButtonPlus));
        this._buttonReturn.addClickEventListenerEx(handler(this,this.onButtonReturn));
    }
    onEnter() {
    }
    onExit() {
        this.unschedule(this._waitUpdateListView);
    }
    updateView(detailData) {
        this._detailData = detailData;
        var secondHeroDatas = detailData.getHeroDataInReinforcements();
        var heroDatas = detailData.getHeroDataInBattle();
        var partnerInfo = HeroDataHelper.getPartnersInfoByUserDetail(secondHeroDatas);
        for (var i = 1;i<=8;i++) {
            var info = partnerInfo[i-1];
            this['_fileNodePartner' + i].onlyShow(info);
        }
        this._updateTotalCount(heroDatas);
        this._updateAvatar(heroDatas);
        this._updateListView(heroDatas);
    }
    _updateTotalCount(heroDatas) {
        var count = HeroDataHelper.getActivatedYokeTotalCount(heroDatas);
        var desContent = Lang.get('hero_yoke_activated_total_count', { count: count });
        let richText = RichTextExtend.createWithContent(desContent);
        var size = this._panelTotalCountBg.getContentSize();
        this._panelTotalCountBg.removeAllChildren();
        this._panelTotalCountBg.addChild(richText.node);
    }
    _updateListView(heroDatas) {
        this._listView.content.removeAllChildren();
        var allInfo = HeroDataHelper.getYokeDetailInfo(heroDatas);
        this.scheduleOnce(this._waitUpdateListView.bind(this,allInfo,allInfo.length-1),0.2);
    }
    _waitUpdateListView(allInfo,i):void{
        if(i<0)
        {
            var curContentS = this._listView.content.getContentSize();
            this._listView.scrollToTop();
            return;
        }
        var info = allInfo[i];
        var module1 = (cc.instantiate(this._teamYokeDynamicModule) as cc.Node).getComponent(TeamYokeDynamicModule) as TeamYokeDynamicModule;
        module1.setInitData();
        module1.updateView(info.yokeInfo);
        UIHelper.updateCurstomListSize(this._listView.content,module1.node);
        var title = this._createDetailTitle(info.heroBaseId,i);
        UIHelper.updateCurstomListSize(this._listView.content,title);
        var p = i - 1;
        this._listView.scrollToTop();
        this.scheduleOnce(this._waitUpdateListView.bind(this,allInfo,p),0.2);
    }
    _createDetailTitle(heroBaseId, index?) {
        var title = (cc.instantiate(this._commonDetailTitleWithBg) as cc.Node).getComponent(CommonDetailTitleWithBg);
        var name = '';
        var color = new cc.Color();
        var colorOutline = null;
        if (index == 0) {
            name = this._detailData.getName();
            var officeLevel = this._detailData.getOfficeLevel();
            color = Colors.getOfficialColor(officeLevel);
            colorOutline = Colors.getOfficialColorOutlineEx(officeLevel);
        } else {
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
            name = heroParam.name;
            color = heroParam.icon_color;
            if (heroParam.icon_color_outline_show) {
                colorOutline = heroParam.icon_color_outline;
            }
        }
        title.setTitle(name);
        title.setTitleColor(color);
        if (colorOutline) {
            title.setTitleOutLine(colorOutline);
        }
        title.setFontSize(22);
        var widget = new cc.Node();
        var titleSize = cc.size(562, 36);
        widget.setContentSize(titleSize);
        title.node.setPosition(titleSize.width / 2, titleSize.height / 2);
        widget.addChild(title.node);
        return widget;
    }
    _updateAvatar(heroDatas) {
        var infos = HeroDataHelper.getYokeOverviewInfo(heroDatas);
        for (var i = 1;i<=5;i++) {
            var info = infos[i-1];
            if (info) {
                this['_fileNodeAvatar' + i].node.active = (true);
                this['_fileNodeAvatar' + i].updateView(info.baseId, info.activatedCount, info.totalCount, info.limitLevel, info.limitRedLevel);
            } else {
                this['_fileNodeAvatar' + i].node.active = (false);
            }
        }
    }
    private onButtonPlus() {
        this._panelIndex = 2;
        this.updatePanel();
    }
    private onButtonReturn() {
        this._panelIndex = 1;
        this.updatePanel();
    }
    updatePanel() {
        if (this._panelIndex == 1) {
            this._panelOverview.active = (true);
            this._panelDetail.active = (false);
        } else {
            this._panelOverview.active = (false);
            this._panelDetail.active = (true);
        }
    }
}