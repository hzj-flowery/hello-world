import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_ConfigLoader, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonSwitchLevel1 from "../../../ui/component/CommonButtonSwitchLevel1";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import CommonListItem from "../../../ui/component/CommonListItem";
import PopupAlert from "../../../ui/PopupAlert";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import SeasonSilkIconCell from "./SeasonSilkIconCell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupSilkRecommandCell extends CommonListItem {
    @property({ type: cc.Node, visible: true })
    _resource: cc.Node = null;
    @property({ type: cc.Sprite, visible: true })
    _imgBg: cc.Sprite = null;
    @property({ type: CommonCustomListView, visible: true })
    _listView: CommonCustomListView = null;
    @property({ type: cc.Label, visible: true })
    _textDesc: cc.Label = null;
    @property({ type: CommonButtonSwitchLevel1, visible: true })
    _btnApply: CommonButtonSwitchLevel1 = null;
    @property({ type: cc.Prefab, visible: true })
    seasonSilkIconCell: cc.Prefab = null;

    _silkList: any[];
    _curGroupPos: any;
    _bgCapInsets: any;
    _data: any;

    ctor() {
        this._silkList = [];
        this._curGroupPos = null;
        this._bgCapInsets = null;

        this.node.name = ('PopupSilkRecommandCell');
    }
    onCreate() {
        this._updateSize();
     //   this._listView.doLayout();
        //this._listView.setSwallowTouches(false);
        this._btnApply.setString(Lang.get('season_silk_recommand_apply'));
        // this._bgCapInsets = this._imgBg.getCapInsets();
        this._btnApply.addClickEventListenerEx(handler(this, this._onBtnApply));
    }
    onEnter() {
        // this._initData();
        // this._updateListView();
    }
    _initData() {
        this._silkList = [];
    }
    _updateSize() {
        var size = this._resource.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    _createCell(item) {
        var cell = cc.instantiate(this.seasonSilkIconCell).getComponent(SeasonSilkIconCell);
        cell.updateUI(item);
        this._listView.pushBackCustomItem(cell.node);
    }
    _updateListView() {
        this._listView.removeAllChildren();
        for (var i in this._silkList) {
            var v = this._silkList[i];
            var item: any = {};
            item.silkId = v;
            this._createCell(item);
        }
    }
    _onBtnApply(sender) {
        if (!this._curGroupPos) {
            return;
        }
        var callback = function () {
            G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_APPLY_RECOMMAND_SILK);
            G_UserData.getSeasonSport().setModifySilkGroupName(true);
            G_UserData.getSeasonSport().c2sFightsSilkbagSetting(this._curGroupPos, this._data.title, this._silkList);
        }.bind(this);
        var title = Lang.get('season_silk_recommand_confirm_title');
        var content = Lang.get('season_silk_recommand_confirm', { name: this._data.title });
        UIPopupHelper.popupCommonView(PopupAlert, function (popup: PopupAlert) {
            popup.init(title, content, callback);
            popup.openWithAction();
        });
    }
    updateUI(itemId, datas) {
        var [pos, data] = datas;
        if (!data) {
            return;
        }
        this._curGroupPos = pos;
        this._data = data;
        var index = data.index;
        var bgres = null;
        if (index % 2 == 1) {
            bgres = Path.getUICommon('img_com_board_list01a');
        } else {
            bgres = Path.getUICommon('img_com_board_list01b');
        }
        UIHelper.loadTexture(this._imgBg, bgres);
        // this._imgBg.setCapInsets(this._bgCapInsets);
        var descStr = Lang.get('season_silk_recommand_cell_desc', {
            title: data.title,
            desc: data.desc
        });
        this._textDesc.string = (descStr);
        this._silkList = [];
        for (var i = 1; i <= 10; i++) {
            var item = data['silkbag' + i];
            var info = G_ConfigLoader.getConfig(ConfigNameConst.SILKBAG).get(item);
            if (info) {
                this._silkList.push(item);
            }
        }
        this._updateListView();
    }
}