import { TacticsConst } from "../../../const/TacticsConst";
import EffectGfxNode from "../../../effect/EffectGfxNode";
import { Colors, G_EffectGfxMgr, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonTacticsIcon from "../../../ui/component/CommonTacticsIcon";
import { TacticsDataHelper } from "../../../utils/data/TacticsDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export class TacticsItem extends cc.Component {
    private _target: any;
    private _isUseShader: boolean;


    @property({
        type: cc.Node,
        visible: true
    }) _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    }) _imgBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    }) _imgSelected: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    }) _imgText1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    }) _textNum: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    }) _nodeMask: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imgMask2: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    }) _txtPercent: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    }) _txtUnlock: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    }) _txtName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    }) _txtHero: cc.Label = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    }) _imgMaskPercent: cc.ProgressBar = null;

    @property({
        type: CommonTacticsIcon,
        visible: true
    }) _nodeTacticsIcon: CommonTacticsIcon = null;

    @property({
        type: cc.Node,
        visible: true
    }) _effectNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _panel: cc.Node = null;
    private _clickIcon: any;
    private _subEffect: any;
    private _tacticsUnitData: any;
    private _index: any;
    private _subIndex: any;





    onLoad() {
        this._isUseShader = false;
        this._init();
    }
    _init() {
        this._imgSelected.node.active = (false);
        this._imgText1.node.active = (false);
        UIHelper.addClickEventListenerEx(this._panel, handler(this, this._onClickIcon));
        this._initProgress();
        this._initEffect();
    }
    setCallback(clickIcon) {
        this._clickIcon = clickIcon;
    }
    setVisible(visible) {
        this.node.active = (visible);
    }
    setSelected(isSel) {
        if (isSel) {
            this._imgSelected.node.active = true;
            this._subEffect.node.active = (true);
            this._subEffect.play();
        } else {
            this._imgSelected.node.active = false;
            this._subEffect.node.active = (false);
            this._subEffect.stop();
        }
    }
    _initProgress() {
        // if (this._imgMaskPercent) {
        //     return;
        // }
        // var pic = Path.getTacticsImage('img_tactis_zhezhao01');
        // var pt = new cc.ProgressBar(new cc.Sprite(pic));
        // this._nodeMask.addChild(pt);
        // pt.setType(cc.PROGRESS_TIMER_TYPE_RADIAL);
        // pt.setPercentage(50);
        // var scaleFactor = 80 / 72;
        // pt.setScale(-scaleFactor, scaleFactor);
        // this._imgMaskPercent = pt;
    }
    _initEffect() {
        function eventFunc(event, frameIndex, node) {
            if (event == 'forever') {
            }
        }
        var subEffect = G_EffectGfxMgr.createPlayGfx(this._effectNode, 'effect_zhanfa_kuang', eventFunc);
        subEffect.node.active = (false);
        this._subEffect = subEffect;
    }
    getTarget() {
        return this._target;
    }
    refresh() {
        this.updateUI(this._tacticsUnitData, this._index, this._subIndex);
    }
    updateUI(tacticsUnitData, index, subIndex) {
        this._tacticsUnitData = tacticsUnitData;
        this._index = index;
        this._subIndex = subIndex;
        var value = tacticsUnitData.getConfig().id;
        var itemParams = this._nodeTacticsIcon.updateUI(tacticsUnitData.getBase_id());
        this._txtName.string = (itemParams.name);
        this.node.name = itemParams.name;
        this._txtName.node.color = (itemParams.icon_color);
        if (itemParams.icon_color_outline_show) {
            UIHelper.enableOutline(this._txtName, itemParams.icon_color_outline, 2);
        }
        this._imgMask2.active = (false);
        var needShader = false;
        if (!tacticsUnitData.isUnlocked()) {
            this._textNum.node.active = (false);
            this._txtPercent.node.active = (false);
            this._imgMaskPercent.node.active = (false);
            var canUnlock = TacticsDataHelper.isCanUnlocked(tacticsUnitData);
            this._txtUnlock.node.active = (canUnlock);
            this._txtHero.node.active = (false);
            this._imgMask2.active = (true);
            needShader = true;
        } else if (!tacticsUnitData.isStudied()) {
            this._textNum.node.active = (false);
            this._txtPercent.node.active = (true);
            this._imgMaskPercent.node.active = (true);
            this._txtUnlock.node.active = (false);
            this._txtHero.node.active = (false);
            var percent = this._tacticsUnitData.getProficiency() / (TacticsConst.MAX_PROFICIENCY / 100);
            this._txtPercent.string = (Lang.get('hero_detail_common_percent', { value: percent }));
            this._imgMaskPercent.progress = (1 - percent);
        } else {
            this._textNum.node.active = (true);
            this._txtPercent.node.active = (false);
            this._imgMaskPercent.node.active = (false);
            this._txtUnlock.node.active = (false);
            if (tacticsUnitData.getHero_id() > 0) {
                this._txtHero.node.active = (true);
                var heroUnitData = G_UserData.getHero().getUnitDataWithId(tacticsUnitData.getHero_id());
                var baseId = heroUnitData.getBase_id();
                var params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId);
                this._txtHero.node.active = (true);
                this._txtHero.string = (params.name);
                this._textNum.string = (Lang.get('tactics_item_puton'));
                this._textNum.node.color = (Colors.RED);
            } else {
                this._txtHero.node.active = (false);
                this._textNum.string = (Lang.get('tactics_item_empty'));
                this._textNum.node.color = (Colors.TacticsActiveColor);
            }
        }
        if (needShader) {
            this._isUseShader = true;

            //ShaderHalper.filterNode(this._nodeTacticsIcon, 'gray');
        } else {
            this._isUseShader = false;
            //ShaderHalper.filterNode(this._nodeTacticsIcon, '', true);
        }
        this._updateRedPoint();
    }
    _updateRedPoint() {
        var node = this._panel;
        var posPercent = cc.v2(0.8, 0.8);
        var show = this._tacticsUnitData.isCanUnlock();
        if (show) {
            var redImg = node.getChildByName('redPoint');
            if (!redImg) {
                redImg = UIHelper.createImage({ texture: Path.getUICommon('img_redpoint') });
                redImg.name = ('redPoint');
                node.addChild(redImg);
                if (posPercent) {
                    UIHelper.setPosByPercent(redImg, posPercent);
                }
            }
            redImg.active = (true);
        } else {
            var redImg = node.getChildByName('redPoint');
            if (redImg) {
                redImg.active = (false);
            }
        }
    }
    isTouched(pos) {
        var locationInNode = this._imgBg.node.convertToNodeSpace(pos);
        var s = this._imgBg.node.getContentSize();
        var rect = cc.rect(0, 0, s.width, s.height);
        if (rect.contains(locationInNode)) {
            return true;
        } else {
            return false;
        }
    }
    _onClickIcon() {
        if (this._clickIcon) {
            this._clickIcon(this._subIndex);
        }
    }
}