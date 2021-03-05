const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { SignalConst } from '../../../const/SignalConst';
import { SynthesisConst } from '../../../const/SynthesisConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import CommonSynthesisIcon from '../../../ui/component/CommonSynthesisIcon';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { SynthesisDataHelper } from '../../../utils/data/SynthesisDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import SynthesisTabIcon from './SynthesisTabIcon';
import { ObjKeyLength } from '../../../utils/GlobleFunc';




@ccclass
export default class SynthesisView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelContent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelMaterial2: cc.Node = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_2_1: CommonSynthesisIcon = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_2_2: CommonSynthesisIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    @property({
        type: cc.Node,
        visible: true
    })
    _panelMaterial4: cc.Node = null;
    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_4_1: CommonSynthesisIcon = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_4_2: CommonSynthesisIcon = null;
    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_4_3: CommonSynthesisIcon = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_4_4: CommonSynthesisIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelMaterial5: cc.Node = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_5_1: CommonSynthesisIcon = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_5_2: CommonSynthesisIcon = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_5_3: CommonSynthesisIcon = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_5_4: CommonSynthesisIcon = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_5_5: CommonSynthesisIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelMaterial6: cc.Node = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_6_1: CommonSynthesisIcon = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_6_2: CommonSynthesisIcon = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_6_3: CommonSynthesisIcon = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_6_4: CommonSynthesisIcon = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_6_5: CommonSynthesisIcon = null;

    @property({
        type: CommonSynthesisIcon,
        visible: true
    })
    _mat_6_6: CommonSynthesisIcon = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollViewTab: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTab: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelTab2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _tab1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _tab2: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _tabIcon1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _tabIcon2: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _name1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _name2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _tabRedPoint2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _tabRedPoint1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _tabIcon2_1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _tabIcon2_2: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _tabIcon2_3: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _name2_1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _name2_2: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _name2_3: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _tabRedPoint2_1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _tabRedPoint2_2: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _tabRedPoint2_3: cc.Sprite = null;


    @property({
        type: cc.Label,
        visible: true
    })
    _resultTips: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _baguaEffectNode: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _synthesisBtn: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _nodeSilver: CommonResourceInfo = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _faguangEffectNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _resultIcon: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _juheEffectNode: cc.Node = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    _selectSynthesisType: any;
    _selectItemTabIndex: any;
    _synthesisData: any;
    _synthesisDataTypes: any;
    _signalSynthesisResultMsg: any;

    public static waitEnterMsg(callBack) {
        cc.resources.load("prefab/synthesis/SynthesisTabIcon", cc.Prefab, () => {
            callBack();
        })
    }

    ctor(type, index) {
        this._selectSynthesisType = type;
        this._selectItemTabIndex = index || 1;
        this._synthesisData = null;
        this._synthesisDataTypes = null;
    }
    onCreate() {
        this._topbarBase.setImageTitle('txt_sys_com_hecheng');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._synthesisData = G_UserData.getSynthesis().getSynthesisConfigData();
        this._synthesisDataTypes = G_UserData.getSynthesis().getDataTypes(this._synthesisData);
        this._selectSynthesisType = this._selectSynthesisType || this._synthesisDataTypes[0];
        this._selectItemTabIndex = this._selectItemTabIndex || 1;
        this._initTab();
        this._initItemTab();
        this._updateTabIcons();
        this._synthesisBtn.setVisible(ObjKeyLength(this._synthesisData)  > 0); 
        this._synthesisBtn.setString(Lang.get('synthesis_title'));
        this._synthesisBtn.addClickEventListenerEx(handler(this, this.onClickSynthesisCallback));
    }
    onEnter() {
        this._signalSynthesisResultMsg = G_SignalManager.add(SignalConst.EVENT_SYNTHESIS_RESULT, handler(this, this._onSynthesisResult));
        this._updateView();
        this._playBaguaEffect();
    }
    onExit() {
        this._signalSynthesisResultMsg.remove();
        this._signalSynthesisResultMsg = null;
    }
    _initTab() {
        this._scrollViewTab.content.removeAllChildren();
        var len = ObjKeyLength(this._synthesisData); // SynthesisDataHelper.getSynthesisDataLength(this._synthesisData);
        for (let index = 1; index <= this._synthesisDataTypes.length; index++) {
            var type = this._synthesisDataTypes[index - 1];
            let cell = Util.getNode("prefab/synthesis/SynthesisTabIcon", SynthesisTabIcon) as SynthesisTabIcon;
            cell.initData(handler(this, this._onClickLeftTabIcon));
            this['_nodeTabIcon' + index] = cell;
            this._scrollViewTab.content.addChild(cell.node);
            this['_nodeTabIcon' + index].updateUI(index, type, len);
            cell.node.x = 7;
            cell.node.y = index * -150;
            this._scrollViewTab.content.height = Math.abs(cell.node.y);
        }
    }
    _refreshLeftTabRedPoint() {
        for (var index = 0; index < this._synthesisDataTypes.length; index++) {
            var type = this._synthesisDataTypes[index];
            var isNeedShowRedPoint = G_UserData.getSynthesis().checkMaterailEnoughByType(this._synthesisData, type);
            this['_nodeTabIcon' + (index + 1)].showRedPoint(isNeedShowRedPoint);
        }
    }
    _refreshItemTabRedPoint() {
        var curSelectIds = this._synthesisData[this._selectSynthesisType];
        for (var index = 0; index < this._synthesisData[this._selectSynthesisType].length; index++) {
            var id = this._synthesisData[this._selectSynthesisType][index];
            var isNeedShowRedPoint = G_UserData.getSynthesis().checkMaterailEnoughById(id);
            var nodeTabRedPoint;
            if (curSelectIds.length == 2) {
                nodeTabRedPoint = this['_tabRedPoint' + (index + 1)];
            } else {
                nodeTabRedPoint = this['_tabRedPoint2_' + (index + 1)];
            }
            nodeTabRedPoint.node.active = (isNeedShowRedPoint);
        }
    }
    _onSynthesisResult(event, awards) {
        this._playJuheEffect(awards);
        this._playMaterialIconEffect();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_SYNTHESIS);
    }
    _initItemTab() {
        this._initItemTabName();
        this._switchTab();
    }
    _initItemTabName() {
        var curSelectIds = this._synthesisData[this._selectSynthesisType];
        if (curSelectIds == null) {
            return;
        }

        let SynthesisConfig = G_ConfigLoader.getConfig(ConfigNameConst.SYNTHESIS);
        if (curSelectIds.length == 2) {
            this._panelTab.active = (true);
            this._panelTab2.active = (false);
            for (var k in curSelectIds) {
                var id = curSelectIds[k];

                var configInfo = SynthesisConfig.get(id);
                var itemInfo = TypeConvertHelper.convert(configInfo.syn_type, configInfo.syn_value);
                this['_name' + (parseInt(k) + 1)].string = (itemInfo.name);
            }
        } else {
            this._panelTab.active = (false);
            this._panelTab2.active = (true);
            for (k in curSelectIds) {
                var id = curSelectIds[k];
                var configInfo = SynthesisConfig.get(id);
                var itemInfo = TypeConvertHelper.convert(configInfo.syn_type, configInfo.syn_value);
                this['_name2_' + (parseInt(k) + 1)].string = (itemInfo.name);
            }
        }
    }
    onClickSynthesisCallback() {
        var id = this._synthesisData[this._selectSynthesisType][this._selectItemTabIndex - 1];
        let SynthesisConfig = G_ConfigLoader.getConfig(ConfigNameConst.SYNTHESIS);
        var configInfo = SynthesisConfig.get(id);
        if (configInfo == null) {
            return;
        }
        var ownCostNum = UserDataHelper.getNumByTypeAndValue(configInfo.cost_type, configInfo.cost_value);
        if (ownCostNum < configInfo.cost_size) {
            G_Prompt.showTip(Lang.get('common_money_not_enough'));
            return;
        }
        this._synthesisBtn.setEnabled(false);
        G_UserData.getSynthesis().c2sGetSynthesisResult(id);
    }
    _onClickLeftTabIcon(type) {
        if (type == this._selectSynthesisType) {
            return;
        }
        this._selectSynthesisType = type;
        if (this._selectItemTabIndex == 3) {
            this._selectItemTabIndex = 2;
        }
        this._initItemTabName();
        this._updateTabIcons();
        this._switchTab();
        this._updateView();
    }
    onClickMidTab1Icon() {
        if (this._selectItemTabIndex == 1) {
            return;
        }
        this._selectItemTabIndex = 1;
        this._switchTab();
        this._updateView();
    }
    onClickMidTab2Icon() {
        if (this._selectItemTabIndex == 2) {
            return;
        }
        this._selectItemTabIndex = 2;
        this._switchTab();
        this._updateView();
    }
    onClickMidTab3Icon() {
        if (this._selectItemTabIndex == 3) {
            return;
        }
        this._selectItemTabIndex = 3;
        this._switchTab();
        this._updateView();
    }
    _switchTab() {
        this._tabIcon1.node.active = (this._selectItemTabIndex == 1);
        this._tabIcon2.node.active = (this._selectItemTabIndex == 2);
        if (this._selectItemTabIndex == 1) {
            this._name1.node.color = (new cc.Color(199, 93, 9));
            this._name2.node.color = (new cc.Color(229, 137, 70));
            UIHelper.enableOutline(this._name1, new cc.Color(255, 207, 119), 2);
            UIHelper.enableOutline(this._name2, new cc.Color(156, 50, 17), 2);
        } else {
            this._name1.node.color = (new cc.Color(229, 137, 70));
            this._name2.node.color = (new cc.Color(199, 93, 9));
            UIHelper.enableOutline(this._name1, new cc.Color(156, 50, 17), 2);
            UIHelper.enableOutline(this._name2, new cc.Color(255, 207, 119), 2);
        }

        var curSelectIds = this._synthesisData[this._selectSynthesisType];
        for (var i = 1; i <= 3; i++) {
            var nodeTab, nodeName;
            if (curSelectIds.length == 2) {
                nodeTab = this['_tabIcon' + i];
                nodeName = this['_name' + i];
            } else {
                nodeTab = this['_tabIcon2_' + i];
                nodeName = this['_name2_' + i];
            }
            if (curSelectIds.length < i) {
                break;
            }
            if (this._selectItemTabIndex == i) {
                nodeTab.node.active = (true);
                nodeName.node.color = (cc.color(199, 93, 9));
                UIHelper.enableOutline(nodeName, cc.color(255, 207, 119), 2)
            } else {
                nodeTab.node.active = (false);
                nodeName.node.color = (cc.color(229, 137, 70));
                UIHelper.enableOutline(nodeName, cc.color(156, 50, 17), 2)
            }
        }

    }
    _updateTabIcons() {
        for (var index = 0; index < this._synthesisDataTypes.length; index++) {
            var type = this._synthesisDataTypes[index];
            this['_nodeTabIcon' + (index + 1)].setSelected(type == this._selectSynthesisType);
        }
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_SYNTHESIS_TYPE1 + parseInt(this._selectSynthesisType) - 1);
    }
    _updateView() {
        if (this._synthesisData[this._selectSynthesisType] == null) {
            return;
        }
        var configId = this._synthesisData[this._selectSynthesisType][this._selectItemTabIndex - 1];
        let SynthesisConfig = G_ConfigLoader.getConfig(ConfigNameConst.SYNTHESIS);
        var configInfo = SynthesisConfig.get(configId);
        if (configInfo == null) {
            return;
        }
        var materailNum = SynthesisDataHelper.getSynthesisMaterilNum(configInfo);
        for (var index = 1; index <= SynthesisConst.MAX_MATERIAL_NUM; index++) {
            var panel = this['_panelMaterial' + index];
            if (panel) {
                panel.active = (false);
            }
        }
        var panel = this['_panelMaterial' + materailNum];
        panel.active = (true);
        var isMaterialEnough = true;
        for (var index = 1; index <= materailNum; index++) {
            var materialIcon = this['_mat_' + (materailNum + ('_' + index))];
            var type = configInfo['material_type_' + index];
            var value = configInfo['material_value_' + index];
            var size = configInfo['material_size_' + index];
            var ownNum = UserDataHelper.getNumByTypeAndValue(type, value);
            materialIcon.updateUI(type, value, size, ownNum);
            if (ownNum < size) {
                isMaterialEnough = false;
            }
        }
        this._playFaguangEffect(isMaterialEnough);
        this._nodeSilver.updateUI(configInfo.cost_type, configInfo.cost_value);
        var strSilver = TextHelper.getAmountText1(configInfo.cost_size);
        this._nodeSilver.setCount(strSilver, null, true);
        var ownCostNum = UserDataHelper.getNumByTypeAndValue(configInfo.cost_type, configInfo.cost_value);
        if (ownCostNum >= configInfo.cost_size) {
            this._nodeSilver.setTextColorToDTypeColor();
        } else {
            this._nodeSilver.setTextColorToDTypeColor(false);
        }
        this._synthesisBtn.setEnabled(isMaterialEnough);
        var param = TypeConvertHelper.convert(configInfo.syn_type, configInfo.syn_value);
        this._resultTips.node.color = (param.icon_color);
        UIHelper.enableOutline(this._resultTips, param.icon_color_outline, 2);
        this._resultTips.string = (Lang.get('synthesis_result_tips', { name: param.name }));
        this._playResultIconMovingEffect(Path.getBigItemIconPath(param.cfg.res_id));
        if (materailNum == 2) {
            this._resultIcon.setScale(0.9);
            this._resultIcon.y = (340) - G_ResolutionManager.getDesignHeight() / 2;
            this._faguangEffectNode.y = (340) - G_ResolutionManager.getDesignHeight() / 2;
        } else {
            this._resultIcon.setScale(1);
            this._resultIcon.y = (292) - G_ResolutionManager.getDesignHeight() / 2;
            this._faguangEffectNode.y = (292) - G_ResolutionManager.getDesignHeight() / 2;
        }
        this._refreshLeftTabRedPoint();
        this._refreshItemTabRedPoint();
    }
    _playResultIconMovingEffect(path) {
        function effectFunction(effect) {
            if (effect == 'yin') {
                var resultIcon = (new cc.Node).addComponent(cc.Sprite);
                UIHelper.loadTexture(resultIcon, path);
                return resultIcon.node;
            }
        }
        function eventFunction(event) {
        }
        this._resultIcon.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._resultIcon, 'moving_hecheng_yin', effectFunction.bind(this), eventFunction, true);
    }
    _playBaguaEffect() {
        function effectFunction(effect) {
        }
        function eventFunction(event) {
        }
        this._baguaEffectNode.removeAllChildren();
        G_EffectGfxMgr.createPlayGfx(this._baguaEffectNode, 'effect_hecheng_bagua', eventFunction, true);
    }
    _playFaguangEffect(isEnough) {
        this._faguangEffectNode.removeAllChildren();
        var effectName = '';
        if (isEnough) {
            effectName = 'effect_hecheng_qiangguang';
        } else {
            effectName = 'effect_hecheng_ruoguang';
        }
        G_EffectGfxMgr.createPlayGfx(this._faguangEffectNode, effectName, null, true);
    }
    _playJuheEffect(awards) {
        function eventFunction(event) {
            if (event == 'gongxihuode') {
                G_SceneManager.openPopup("prefab/common/PopupGetRewards", (popup: PopupGetRewards) => {
                    PopupGetRewards.showRewards(awards);
                    this._updateView();
                })
            }
        }
        this._juheEffectNode.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._juheEffectNode, 'moving_hecheng_shanguang', null, eventFunction.bind(this), true);
    }
    _playMaterialIconEffect() {
        var configId = this._synthesisData[this._selectSynthesisType][this._selectItemTabIndex - 1];
        let SynthesisConfig = G_ConfigLoader.getConfig(ConfigNameConst.SYNTHESIS);
        var configInfo = SynthesisConfig.get(configId);
        var materailNum = SynthesisDataHelper.getSynthesisMaterilNum(configInfo);
        for (var index = 1; index <= materailNum; index++) {
            var materialIcon = this['_mat_' + (materailNum + ('_' + index))];
            this._playOneIconEffect(materialIcon.getEffectNode());
        }
    }
    _playOneIconEffect(node) {
        function eventFunction(event) {
        }
        node.removeAllChildren();
        G_EffectGfxMgr.createPlayGfx(node, 'effect_hecheng_iconout', eventFunction, true);
    }


}