const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import AttributeConst from '../../../const/AttributeConst';
import { G_UserData, G_SignalManager, G_SceneManager, G_Prompt, G_ResolutionManager } from '../../../init';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { handler } from '../../../utils/handler';
import { FunctionConst } from '../../../const/FunctionConst';
import PetConst from '../../../const/PetConst';
import { SignalConst } from '../../../const/SignalConst';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { PetDataHelper } from '../../../utils/data/PetDataHelper';
import { table } from '../../../utils/table';
import PetDetailBaseView from './PetDetailBaseView';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Lang } from '../../../lang/Lang';
import UIConst from '../../../const/UIConst';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import UIHelper from '../../../utils/UIHelper';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import ViewBase from '../../ViewBase';
import PopupChoosePetHelper from '../../../ui/popup/PopupChoosePetHelper';
import PopupChoosePet from '../../../ui/popup/PopupChoosePet';
import { AttrRecordUnitData } from '../../../data/AttrRecordUnitData';
var RECORD_ATTR_LIST = [
    [
        AttributeConst.ATK_FINAL,
        '_nodeAttr1'
    ],
    [
        AttributeConst.HP_FINAL,
        '_nodeAttr2'
    ],
    [
        AttributeConst.PD_FINAL,
        '_nodeAttr3'
    ],
    [
        AttributeConst.MD_FINAL,
        '_nodeAttr4'
    ]
];

@ccclass
export default class PetDetailView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePetDetailView: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelMid: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _pageView: cc.Node = null;
    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _avatar: CommonHeroAvatar = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonLeft: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonRight: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBless: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textIsBless: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeButton: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonUnload: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageUnloadRP: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonChange: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageChangeRP: cc.Sprite = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property(cc.Prefab)
    petDetailBaseView: cc.Prefab = null;

    _rangeType: any;
    _allPetIds: any[];
    _changeOldPetId: number;
    _lastPetLevel: {};
    _lastPetRank: {};
    _recordAttr: AttrRecordUnitData;
    _isPageViewMoving: boolean;
    _selectedPos: number;
    _petCount: number;
    _signalChangePetFormation;
    _pageItems: any[];
    _pageViewSize: cc.Size;

    _petDetailBaseView:PetDetailBaseView;

    ctor(petId, rangeType) {
        G_UserData.getPet().setCurPetId(petId);
        this._rangeType = rangeType;
        this._allPetIds = [];
    }
    onCreate() {
        var param = G_SceneManager.getViewArgs('petDetail');
        this.ctor(param[0], param[1]);
        // this._pageView.setScrollDuration(0.3);
        // this._pageView.addEventListener(handler(this, this._onPageViewEvent));
        // this._pageView.addTouchEventListener(handler(this, this._onPageTouch));
        this._pageViewSize = this._pageView.getContentSize();
        this._initData();
        this.setSceneSize();
    }
    _initData() {
        this._changeOldPetId = 0;
        this._lastPetLevel = {};
        this._lastPetRank = {};
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst['FUNC_PET_TEAM_SLOT']);
        this._isPageViewMoving = false;
    }
    _updateData() {
        this._nodeButton.active = (false);
        if (this._rangeType == PetConst.PET_RANGE_TYPE_1) {
            this._allPetIds = G_UserData.getPet().getListDataBySort();
        } else if (this._rangeType == PetConst.PET_RANGE_TYPE_2) {
            this._allPetIds = G_UserData.getTeam().getPetIdsInBattle();
        } else if (this._rangeType == PetConst.PET_RANGE_TYPE_3) {
            this._allPetIds = G_UserData.getTeam().getPetIdsInHelp();
            this._nodeButton.active = (true);
        }
        this._selectedPos = 1;
        var petId = G_UserData.getPet().getCurPetId();
        for (var i in this._allPetIds) {
            var id = this._allPetIds[i];
            if (id == petId) {
                this._selectedPos = parseFloat(i) + 1;
            }
        }
        this._petCount = this._allPetIds.length;
        G_UserData.getPet().setCurPetId(petId);
        this._recordBaseAttr();
        G_UserData.getAttr().recordPower();
    }

    start() {
        this.setSceneSize();
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_shenshou');
    }
    onEnter() {
        this._signalChangePetFormation = G_SignalManager.add(SignalConst.EVENT_PET_ON_TEAM_SUCCESS, handler(this, this._onEventUserPetChange));
        this._updateData();
        this._initPageView();
        this._updateArrowBtn();
        this._updateInfo();
        this._updatePageItem();
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PetDetailView");
    }
    onExit() {
        this._signalChangePetFormation.remove();
        this._signalChangePetFormation = null;
    }
    _setCurPos() {
    }
    _createPageItem() {
        // var widget = new cc.Node();
        // widget.setContentSize(this._pageViewSize.width, this._pageViewSize.height);
        // return widget;
    }
    _updatePageItem() {
        // var index = this._selectedPos;
        // for (var i = index - 1; i <= index + 1; i++) {
        //     var widget = this._pageItems[i];
        //     if (widget) {
        //         var count = widget.getChildrenCount();
        //         var petId = this._allPetIds[i];
        //         if (count == 0 && petId > 0) {
        //             var unitData = G_UserData.getPet().getUnitDataWithId(petId);
        //             var avatar = CSHelper.loadResourceNode(Path.getCSB('CommonHeroAvatar', 'common'));
        //             avatar.setConvertType(TypeConvertHelper.TYPE_PET);
        //             avatar.updateUI(unitData.getBase_id());
        //             avatar.setScale(1);
        //             avatar.setShadowScale(2.7);
        //             avatar.setPosition(cc.v2(this._pageViewSize.width * 0.57, 190));
        //             avatar.playAnimationLoopIdle(handler(this, this._onAvatarCallBack), i);
        //             widget.addChild(avatar);
        //         }
        //     }
        // }
        // this._updatePageItemVisible();
        var unitData = G_UserData.getPet().getUnitDataWithId(G_UserData.getPet().getCurPetId());
        this._avatar.updateUI(unitData.getBase_id());
    }
    _onAvatarCallBack(loopCount, spineHero, heroId, posIndex) {
        if (loopCount == 2 && spineHero.getAnimationName() != 'idle2') {  //this._selectedPos == posIndex &&
            PetDataHelper.playVoiceWithId(heroId);
        }
    }
    _initPageView() {
        // this._pageItems = [];
        // this._pageView.removeAllPages();
        // for (var i = 1; i <= this._petCount; i++) {
        //     var item = this._createPageItem();
        //     this._pageView.addPage(item);
        //     this._pageItems.push(item);
        // }
        // this._updatePageItem();
        // this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        // var item = this._createPageItem();
        // this._pageView.addChild(item);
        this._avatar.setConvertType(TypeConvertHelper.TYPE_PET);
        this._avatar.setScale(1);
        this._avatar.setShadowScale(2.7);
        this._avatar.node.setPosition(cc.v2(50, -130));
        this._avatar.playAnimationLoopIdle(handler(this, this._onAvatarCallBack), 0);

    }
    _updateInfo() {
        this._nodePetDetailView.removeAllChildren();
        var curPetId = G_UserData.getPet().getCurPetId();
        var petDetail = cc.instantiate(this.petDetailBaseView).getComponent(PetDetailBaseView);
        this._petDetailBaseView = petDetail;
        petDetail.ctor(curPetId, null, this._rangeType);
        this._nodePetDetailView.addChild(petDetail.node);
        var petUnitData = G_UserData.getPet().getUnitDataWithId(curPetId);
        var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_CHANGE, petUnitData);
        this._imageChangeRP.node.active = (reach);
        var strDesc = UserDataHelper.getPetStateStr(petUnitData);
        if (strDesc) {
            this._textIsBless.string = (strDesc);
            this._textIsBless.node.active = (true);
        } else {
            this._textIsBless.node.active = (false);
        }
    }
    _updateArrowBtn() {
        this._buttonLeft.node.active = (this._selectedPos > 1);
        this._buttonRight.node.active = (this._selectedPos < this._petCount);
    }
    onButtonLeftClicked() {
        if (this._selectedPos <= 1) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        this._setCurPos();
        var curPetId = this._allPetIds[this._selectedPos - 1];
        G_UserData.getPet().setCurPetId(curPetId);
        this._updateArrowBtn();
        //   this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        this._updateInfo();
        this._updatePageItem();
    }
    onButtonRightClicked() {
        if (this._selectedPos >= this._petCount) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        this._setCurPos();
        var curPetId = this._allPetIds[this._selectedPos - 1];
        G_UserData.getPet().setCurPetId(curPetId);
        this._updateArrowBtn();
        //  this._pageView.setCurrentPageIndex(this._selectedPos - 1);
        this._updateInfo();
        this._updatePageItem();
    }
    _onPageTouch(sender, state) {
        // if (state == ccui.TouchEventType.began) {
        //     this._isPageViewMoving = true;
        //     this._updatePageItemVisible();
        // } else if (state == ccui.TouchEventType.ended || state == ccui.TouchEventType.canceled) {
        //     this._isPageViewMoving = false;
        // }
    }
    _updatePageItemVisible() {
        // var curIndex = this._selectedPos;
        // for (var i in this._pageItems) {
        //     var item = this._pageItems[i];
        //     if (i == curIndex) {
        //         item.node.active = (true);
        //     } else {
        //         item.node.active = (this._isPageViewMoving);
        //     }
        // }
    }
    _onPageViewEvent(sender, event) {
        // if (event == ccui.PageViewEventType.turning && sender == this._pageView) {
        //     var targetPos = this._pageView.getCurrentPageIndex() + 1;
        //     if (targetPos != this._selectedPos) {
        //         this._selectedPos = targetPos;
        //         this._setCurPos();
        //         var curPetId = this._allPetIds[this._selectedPos];
        //         G_UserData.getPet().setCurPetId(curPetId);
        //         this._updateArrowBtn();
        //         this._updateInfo();
        //         this._updatePageItem();
        //     }
        // }
    }
    _changePetCallBack(petId) {
        var oldPet = G_UserData.getPet().getCurPetId();
        var oldPetUnit = G_UserData.getPet().getUnitDataWithId(oldPet);
        if (oldPet && oldPetUnit) {
            G_UserData.getPet().c2sPetOnTeam(petId, 2, oldPetUnit.getPos() - 1);
        }
    }
    onButtonUnloadClicked() {
        var pos = this._selectedPos;
        var petId = this._allPetIds[this._selectedPos -1];
        var petUnit = G_UserData.getPet().getUnitDataWithId(petId);
        if (petUnit) {
            G_UserData.getPet().c2sPetOnTeam(0, 2, petUnit.getPos() - 1);
        }
        G_SceneManager.popScene();
    }
    onButtonChangeClicked() {
        var petId = this._allPetIds[this._selectedPos -1];
        var isEmpty = PopupChoosePetHelper.checkIsEmpty(PopupChoosePetHelper.FROM_TYPE3, [petId]);
        if (isEmpty) {
            G_Prompt.showTip(Lang.get('pet_popup_list_empty_tip' + PopupChoosePetHelper.FROM_TYPE3));
        } else {
            var callBack = handler(this, this._changePetCallBack);
            G_SceneManager.openPopup('prefab/common/PopupChoosePet',(popupChoosePet:PopupChoosePet) => {
                popupChoosePet.setTitle(Lang.get("pet_help_replace_title"));
                popupChoosePet.updateUI(PopupChoosePetHelper.FROM_TYPE3, callBack, petId);
                popupChoosePet.openWithAction();
            });
        }
    }
    _onEventUserPetChange(_, petId) {
        if (petId == 0) {
            return;
        }
        G_UserData.getPet().setCurPetId(petId);
        this._updateData();
        this._initPageView();
        this._updateArrowBtn();
        this._updateInfo();
        this._updatePageItem();
        this._changeOldPetId = petId;
        this._playChangePetSummary();
    }
    _recordBaseAttr() {
        var curPetId = G_UserData.getPet().getCurPetId();
        var curUnit = G_UserData.getPet().getUnitDataWithId(curPetId);
        var param = { unitData: curUnit };
        var attrInfo = UserDataHelper.getPetTotalAttr(param);
        this._recordAttr.updateData(attrInfo);
    }
    _playChangePetSummary() {
        var summary = [];
        var successStr = '';
        if (this._changeOldPetId && this._changeOldPetId > 0) {
            successStr = Lang.get('summary_pet_change');
        } else if (this._changeOldPetId == 0) {
            this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst['FUNC_PET_HELP_SLOT' + this._selectedPos]);
            this._recordBaseAttr();
            successStr = Lang.get('summary_pet_level_team');
        } else {
            this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst['FUNC_PET_HELP_SLOT' + this._selectedPos]);
            this._recordBaseAttr();
            successStr = Lang.get('summary_pet_inbattle');
        }
        var param2 = {
            content: successStr,
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
            finishCallback: function () {
                if (this._onChangePetSummaryFinish) {
                    this._onChangePetSummaryFinish();
                }
            }.bind(this)
        };
        summary.push(param2);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(null, -5);
    }
    _addBaseAttrPromptSummary(summary) {
        for (var i in RECORD_ATTR_LIST) {
            var one: any[] = RECORD_ATTR_LIST[i];
            let attrId = one[0];
            var dstNodeName = one[1];
            var diffValue = this._recordAttr.getDiffValue(attrId);
            if (diffValue != 0) {
                let dstNode =this._petDetailBaseView.attrModule[dstNodeName].node;
                var pos = dstNode ? UIHelper.convertSpaceFromNodeToNode(dstNode,  G_SceneManager.getRunningSceneRootNode()) : null;
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN + UIConst.SUMMARY_OFFSET_X_ATTR },
                    dstPosition: pos,
                    finishCallback: function () {
                       // var dstNode = this._nodePetDetailView.getChildByName(dstNodeName);
                        if (attrId && dstNode) {
                            var curValue = this._recordAttr.getCurValue(attrId);
                          //  dstNode.getChildByName('TextValue').updateTxtValue(curValue);
                          dstNode.getChildByName('TextValue').string = (curValue).toString();
                        }
                    }.bind(this)
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _onChangePetSummaryFinish() {
        this.node.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'PetDetailView');
        })));
    }
}