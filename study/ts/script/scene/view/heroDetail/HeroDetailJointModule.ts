const { ccclass, property } = cc._decorator;

import { HeroUnitData } from '../../../data/HeroUnitData';
import { Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { CommonDetailModule } from '../../../ui/component/CommonDetailModule';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';
import CommonUI from '../../../ui/component/CommonUI';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Path } from '../../../utils/Path';


@ccclass
export default class HeroDetailJointModule extends ListViewCellBase implements CommonDetailModule {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon1: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName1: cc.Label = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon2: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAdd: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDesc: cc.Label = null;

    private _heroUnitData: HeroUnitData;
    private _noCanClickIcon: boolean;

    constructor() {
        super();
    }

    public setInitData(heroUnitData: HeroUnitData, noCanClickIcon?): void {
        this._heroUnitData = heroUnitData;
        this._noCanClickIcon = noCanClickIcon || false;

        var contentSize = this._panelBg.getContentSize();
        this.node.setContentSize(contentSize);
        this._nodeTitle.setFontSize(24);
        this._nodeTitle.setTitle(Lang.get('hero_detail_title_joint'));
        
        this._fileNodeIcon1.onLoad();
        this._fileNodeIcon2.onLoad();
        this._fileNodeIcon1.setTouchEnabled(true);
        this._fileNodeIcon2.setTouchEnabled(true);
        if (this._noCanClickIcon) {
            this._fileNodeIcon1.setTouchEnabled(false);
            this._fileNodeIcon2.setTouchEnabled(false);
        }

    }

    public numberOfCell(): number {
        return 1;
    }

    public cellAtIndex(i: number): cc.Node {
        this.updateData(this._heroUnitData);
        return this.node;
    }

    onLoad(): void {
        super.onLoad();
    }

    private updateData(heroUnitData: HeroUnitData): void {
        var heroConfig = heroUnitData.getConfig();
        var jointType = heroConfig.skill_3_type;
        var jointHeroId = heroConfig.skill_3_partner;
        var heroId1 = jointType == 1 && heroUnitData.getBase_id() || jointHeroId;
        var heroId2 = jointType == 1 && jointHeroId || heroUnitData.getBase_id();
        this._fileNodeIcon1.updateUI(heroId1 || 0);
        this._fileNodeIcon2.updateUI(heroId2 || 0);
        var otherIcon = jointType == 1 && this._fileNodeIcon2 || this._fileNodeIcon1;
        if (this._heroUnitData.isUserHero() && !heroUnitData.isActiveJoint()) {
            otherIcon.setIconMask(true);
            this._imageAdd.addComponent(CommonUI).loadTexture(Path.getTeamUI('img_teamtrain_plussign_1'));
        }
        var param1 = this._fileNodeIcon1.getItemParams();
        var param2 = this._fileNodeIcon2.getItemParams();

        if (param1) {
            this._textName1.string = (param1.name) || "";
            this._textName1.node.color = (param1.icon_color) || Colors.BABY_BLUE;
        }

        if (param2) {
            this._textName2.string = (param2.name) || "";
            this._textName2.node.color = (param2.icon_color) || Colors.BABY_BLUE;
        }
        this._textDesc.string = (Lang.get('hero_detail_joint_tip'));
    }

}