const { ccclass, property } = cc._decorator;

import CommonMainMenu from '../../../ui/component/CommonMainMenu'

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import { G_UserData, G_SignalManager, G_ResolutionManager, G_Prompt, G_ConfigLoader } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { Path } from '../../../utils/Path';
import { handler } from '../../../utils/handler';
import { table } from '../../../utils/table';
import PetHandBookCell from './PetHandBookCell';
import { FunctionConst } from '../../../const/FunctionConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Lang } from '../../../lang/Lang';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import UIConst from '../../../const/UIConst';
import ViewBase from '../../ViewBase';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import CommonCustomListView from '../../../ui/component/CommonCustomListView';

@ccclass
export default class PetHandBookView extends ViewBase {

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: CommonCustomListView,
        visible: true
    })
    _petListView: CommonCustomListView = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _funcIcon1: CommonMainMenu = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBtnBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _petCellName: cc.Label = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    petHandBookCell: cc.Prefab = null;

    static signal;
    _petCellList: any[];
    _recordAttr;
    _signalActivePetPhoto;
    _currAttrInfo: any;

    static waitEnterMsg(callBack) {
        function onMsgCallBack() {
            callBack();
            PetHandBookView.signal.remove();
            PetHandBookView.signal = null;
        }
        G_UserData.getHandBook().c2sGetResPhoto();
        PetHandBookView.signal = G_SignalManager.add(SignalConst.EVENT_GET_RES_PHOTO_SUCCESS, onMsgCallBack);
    }
    onCreate() {
        this.setSceneSize()
        this._petCellList = [];
        this['_funcIcon1'].updateUI(FunctionConst.FUNC_PET_HAND_BOOK_ADD);
        this['_funcIcon1'].addClickEventListenerEx(handler(this, this._onButtonClick));
        this['_funcIcon1'].node.active = (false);
    }
    _onButtonClick(sender) {
        var funcId = sender.getTag();
        if (funcId > 0) {
            WayFuncDataHelper.gotoModuleByFuncId(funcId);
        }
    }
    _iniPetList() {
        this._petCellList = [];
        var pet_map = G_ConfigLoader.getConfig(ConfigNameConst.PET_MAP);
        this._petListView.removeAllChildren();
        for (var loop = 0; loop < pet_map.length(); loop++) {
            var petMapData = pet_map.indexOf(loop);
            if (G_UserData.getPet().isPetMapShow(petMapData.id) == true) {
                var cell = this.pushPetCell(petMapData);
                this._petCellList.push(cell);
            }
        }
    }
    getPetCellById(petMapId) {
        for (var i in this._petCellList) {
            var cellWidget = this._petCellList[i];
            if (cellWidget.getPetMapId() == petMapId) {
                return cellWidget;
            }
        }
        return null;
    }
    pushPetCell(petMapData) {
        var cell = cc.instantiate(this.petHandBookCell).getComponent(PetHandBookCell);
        cell.updateUI(petMapData);
        this._petListView.pushBackCustomItem(cell.node);
        return cell;
    }
    onEnter() {
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_shenshoutujian');
        this._topbarBase.node.x = (1136 - G_ResolutionManager.getDesignWidth()) / 2;
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst['FUNC_PET_HAND_BOOK_ADD']);
        this._signalActivePetPhoto = G_SignalManager.add(SignalConst.EVENT_ACTIVE_PET_PHOTO_SUCCESS, handler(this, this._onEventActivePetPhoto));
        this._iniPetList();
        this._updateData();
    }
    onExit() {
        this._signalActivePetPhoto.remove();
        this._signalActivePetPhoto = null;
    }
    _onEventActivePetPhoto(id, message) {
        var petMapId = message.id;
        var cellWidget = this.getPetCellById(petMapId);
        this._updateData();
        this._playPetActiveSummary(petMapId);
        if (cellWidget) {
            cellWidget.procPetMapState();
        }
    }
    _playPetActiveSummary(petMapId) {
        var summary = [];
        if (petMapId) {
            var config = UserDataHelper.getPetMapConfig(petMapId);
            var content = Lang.get('summary_pet_map_active', { petMapName: config.name });
            var param = { content: content };
            summary.push(param);
        }
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary();
    }
    _addBaseAttrPromptSummary(summary) {
        var attrList = this._recordAttr.getCurAttrList();
        for (var key in attrList) {
            var value = attrList[key];
            var attrId = key;
            var diffValue = this._recordAttr.getDiffValue(attrId);
            if (diffValue != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_ATTR }
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _updateData() {
        this._recordBaseAttr();
        G_UserData.getAttr().recordPower();
    }
    _recordBaseAttr() {
        var [attrInfo] = UserDataHelper.getPetMapAttr();
        this._recordAttr.updateData(attrInfo);
        this._currAttrInfo = attrInfo;
    }

}