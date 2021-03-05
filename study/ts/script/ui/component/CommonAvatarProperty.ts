const { ccclass, property } = cc._decorator;

import CommonDetailWindow from './CommonDetailWindow'
import CommonCustomListView from './CommonCustomListView';
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import UIHelper from '../../utils/UIHelper';
import AvatarDetailBaseAttrModule from '../../scene/view/avatar/AvatarDetailBaseAttrModule';
import AvatarDetailSkillModule from '../../scene/view/avatar/AvatarDetailSkillModule';
import AvatarDetailTalentModule from '../../scene/view/avatar/AvatarDetailTalentModule';
import AvatarDetailCombinationModule from '../../scene/view/avatar/AvatarDetailCombinationModule';
import AvatarDetailBriefModule from '../../scene/view/avatar/AvatarDetailBriefModule';
import InstrumentDetailFeatureNode from '../../scene/view/instrument/InstrumentDetailFeatureNode';
import { G_UserData } from '../../init';
import InstrumentConst from '../../const/InstrumentConst';
import { HeroDataHelper } from '../../utils/data/HeroDataHelper';
import { CommonDetailBaseView } from './CommonDetailBaseView';
import { CommonDetailModule } from './CommonDetailModule';
import AvatarDetailInstrumentFeatureModule from '../../scene/view/avatar/AvatarDetailInstrumentFeatureModule';

@ccclass
export default class CommonAvatarProperty extends CommonDetailBaseView {
    protected onCreate() {
    }
    protected onEnter() {
    }
    protected onExit() {
    }

    @property({
        type: CommonDetailWindow,
        visible: true
    })
    _commonDetailWindow: CommonDetailWindow = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _name2: cc.Label = null;

    @property(cc.Node)
    talentModule: cc.Node = null;

    @property(cc.Prefab)
    avatarDetailInstrumentFeatureModule: cc.Prefab = null;

    @property(cc.Prefab)
    combinationModule: cc.Prefab = null;

    @property(cc.Prefab)
    baseAttrModule: cc.Prefab = null;

    @property(cc.Prefab)
    skillModule: cc.Prefab = null;

    @property(cc.Node)
    briefModule: cc.Node = null;

    private _unitData: any;

    _showIds;


    _updateListView() {
        this._listView.content.removeAllChildren();
        this._sectionInfoes = [{
            buildFunc: this._buildBaseAttrModule
        },
        {
            buildFunc: this._buildSkillModule
        },
        {
            buildFunc: this._buildTalentModule
        },
        {
            buildFunc: this._buildInstrumentFeatureModule
        }];
        var strShowId: string = this._unitData.getConfig().show_id;
        this._showIds = strShowId.split('|');
        for (let i = 0; i < this._showIds.length; i++) {
            this._sectionInfoes.push({
                buildFunc: this._buildCombinationModule,
                param: i
            })
        };
        this._sectionInfoes.push({
            buildFunc: this._buildBriefModule
        });
        this.startDraw();
        // this._buildBaseAttrModule();
        // this._buildSkillModule();
        // this._buildTalentModule();
        // this._buildInstrumentFeatureModule();
        // this._buildCombinationModule();
        // this._buildBriefModule();
    }
    updateUI(unitData) {
        this._unitData = unitData;
        this._updateListView();
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_AVATAR, unitData.getBase_id());
        this._name2.string = (param.name);
        this._name2.node.color = (param.icon_color);
        UIHelper.enableOutline(this._name2, param.icon_color_outline, 2);
    }
    _buildBaseAttrModule(): CommonDetailModule {
        var node = cc.instantiate(this.baseAttrModule);
        var moduleItem = node.getComponent(AvatarDetailBaseAttrModule);
        moduleItem.updateUI(this._unitData);
        return moduleItem;
        // this.listView.content.addChild(moduleItem.node);
    }
    _buildSkillModule(): CommonDetailModule {
        var node = cc.instantiate(this.skillModule);
        var moduleItem = node.getComponent(AvatarDetailSkillModule);
        moduleItem.updateUI(this._unitData);
        return moduleItem;
        // this.listView.content.addChild(moduleItem.node);
    }
    _buildTalentModule(): CommonDetailModule {
        var node = cc.instantiate(this.talentModule);
        var moduleItem = node.getComponent(AvatarDetailTalentModule);
        moduleItem.updateUI(this._unitData, true);
        return moduleItem;
     //   this.listView.content.addChild(moduleItem.node);
    }
     _buildInstrumentFeatureModule(): CommonDetailModule {
        var moduleItem = (cc.instantiate(this.avatarDetailInstrumentFeatureModule) as cc.Node).getComponent(AvatarDetailInstrumentFeatureModule);
        moduleItem.updateUI(this._unitData);
        return moduleItem;
    }
    _buildCombinationModule(i):CommonDetailModule {
        var showId = this._showIds[i];
        var node = cc.instantiate(this.combinationModule);
        var moduleItem = node.getComponent(AvatarDetailCombinationModule);
        moduleItem.setTitle(i + 1);
        moduleItem.updateUI(parseInt(showId), true);
        return moduleItem;
    }
    _buildBriefModule(): CommonDetailModule {
        var node = cc.instantiate(this.briefModule);
        node.active = true;
        var moduleItem = node.getComponent(AvatarDetailBriefModule);
        moduleItem.updateUI(this._unitData);
        return moduleItem;
        //this.listView.content.addChild(moduleItem.node);
    }
}
