import { SignalConst } from "../../const/SignalConst";
import { Colors, G_SignalManager } from "../../init";
import { Lang } from "../../lang/Lang";
import { handler } from "../../utils/handler";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import CommonButtonNormal from "../component/CommonButtonNormal";
import CommonIconNameNode from "../component/CommonIconNameNode";
import CommonNormalSmallPop from "../component/CommonNormalSmallPop";
import PopupBase from "../PopupBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupBoxReward extends PopupBase {

    @property({ type: CommonNormalSmallPop, visible: true })
    _commonNodeBk: CommonNormalSmallPop = null;

    @property({ type: CommonButtonNormal, visible: true })
    _btnOk: CommonButtonNormal = null;

    @property({ type: cc.Label, visible: true })
    _textDetail: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeChapter: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _richTextNode: cc.Node = null;

    @property({ type: cc.ScrollView, visible: true })
    _listViewDrop: cc.ScrollView = null;

    @property({ type: cc.Layout, visible: true })
    _listViewContent: cc.Layout = null;

    private _title: string;
    private _callback: Function;
    private _awardList: any[];
    private _commonIconNameNodePrefab: cc.Prefab;

    preloadResList = [
        { path: Path.getPrefab("CommonIconNameNode", "common"), type: cc.Prefab },
        { path: Path.getUICommonFrame('img_frame_bg01'), type: cc.SpriteFrame }

    ]

    public init(title, callback, isClickOtherClose?, isNotCreateShade?) {
        this._title = title || Lang.get('common_btn_help');
        this._callback = callback;
        this.setClickOtherClose(isClickOtherClose);
        this.setNotCreateShade(isNotCreateShade);
    }

    public onCreate() {
        this._commonIconNameNodePrefab = cc.resources.get(Path.getPrefab("CommonIconNameNode", "common"));
        this._commonNodeBk.setTitle(this._title);
        this._btnOk.setString(Lang.get('common_btn_sure'));
        this._btnOk.addClickEventListenerEx(this.onBtnOk.bind(this));
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._listViewDrop.node.setContentSize(100, 230);
    }

    public setBtnEnable(enable) {
        this._btnOk.setEnabled(enable);
    }

    public setBtnText(text) {
        this._btnOk.setString(text);
    }

    public setItemsMargin(margin) {
        this._listViewContent.spacingX = (margin);
        this._listViewContent.spacingY = (margin);
    }

    public setChapterDesc(num) {
        var paramList = [
            {
                type: 'label',
                text: Lang.get('get_star_box_detail3', { count: num }),
                fontSize: 22,
                color: Colors.BRIGHT_BG_TWO,
                anchorPoint: cc.v2(0, 0.5)
            },
            {
                type: 'image',
                texture: Path.getUICommon('img_lit_stars02'),
                filePath: Path.getUICommon('img_lit_stars02'),
                name: 'biantaiStar',
                anchorPoint: cc.v2(0, 0.5),
                size: cc.size(42, 40)
            },
            {
                type: 'label',
                text: Lang.get('get_star_box_detail4'),
                fontSize: 22,
                color: Colors.BRIGHT_BG_TWO,
                anchorPoint: cc.v2(0, 0.5)
            }
        ];
        var node = UIHelper.createRichItems(paramList, true);
        var biantaiStar = node.getChildByName('biantaiStar');
        // biantaiStar.y = (biantaiStar.y - 5);
        this._textDetail.node.active = false;
        this._nodeChapter.removeAllChildren();
        this._nodeChapter.addChild(node);
        this._nodeChapter.active = true;
    }

    public setDetailText(text) {
        this._nodeChapter.active = false;
        this._textDetail.string = (text);
        this._textDetail.node.active = true;
    }

    public setDetailRichText(text) {
        this._textDetail.string = (text);
        this._textDetail.node.active = true;
    }

    private _createCellEx(award): CommonIconNameNode {
        if (this._commonIconNameNodePrefab == null) {
            return;
        }
        var uiNode = cc.instantiate(this._commonIconNameNodePrefab).getComponent(CommonIconNameNode);
        uiNode.showItemBg(true);
        uiNode.updateUI(award.type, award.value, award.size);

        uiNode.setTouchEnabled(true);
        this._listViewContent.node.addChild(uiNode.node);
        return uiNode;
    }

    private _updateAwards() {
        this._listViewContent.node.removeAllChildren();
        if (this._commonIconNameNodePrefab == null) {
            cc.resources.load(Path.getPrefab("CommonIconNameNode", "common"), cc.Prefab, function (err, res) {
                if (err != null || res == null) {
                    return;
                }
                this._loadPrefabComplete(res);
            }.bind(this));
            return;
        }
        this._setAwards();
    }

    private _loadPrefabComplete(res) {
        this._commonIconNameNodePrefab = res;
        this._setAwards();
    }

    private _setAwards() {
        let cellWidth: number = 0;
        for (let i = 0; i < this._awardList.length; i++) {
            var award = this._awardList[i];
            var widget = this._createCellEx(award);
            cellWidth = widget.getPanelSize().width;
        }
        if (this._awardList.length > 4) {
            this._listViewDrop.node.width = cellWidth * 4 + this._listViewContent.spacingX * 3;
            this._listViewContent.node.width = this._listViewDrop.node.width;
            this._listViewDrop.node.height = 230;
            this._listViewDrop.enabled = true;
            this._listViewDrop.node.y = 76;
        } else {
            this._listViewDrop.node.width = cellWidth * this._awardList.length + this._listViewContent.spacingX * (this._awardList.length - 1);
            this._listViewContent.node.width = this._listViewDrop.node.width;
            this._listViewDrop.node.height = 200;
            this._listViewDrop.enabled = false;
            this._listViewDrop.node.y = 50;
        }
    }

    public _onItemSelected(item, index) {
    }

    public _onItemTouch(index, t) {
    }

    public updateUI(awards: any[]) {
        if (awards == null) {
            return;
        }
        this._awardList = awards;

        this._updateAwards();
    }

    public _onInit() {
    }

    public onEnter() {
    }

    public onExit() {
    }

    public onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupBoxReward");
    }

    public onBtnOk() {
        if (this._callback) {
            this._callback();
        }
        this.close();
    }

    public onBtnCancel() {
        this.close();
    }

    public addRichTextDetail(richTextNode: cc.Node) {
        if (!richTextNode) {
            return;
        }
        richTextNode.setAnchorPoint(0.5, 0.5);
        this._richTextNode.addChild(richTextNode);
    }

    public setDetailTextString(text) {
        this._textDetail.string = (text);
    }

    public setDetailTextVisible(isVisible) {
        this._textDetail.node.active = (isVisible);
    }

    public setDetailTextToBottom() {
        this._textDetail.node.y = (-98);
    }
}