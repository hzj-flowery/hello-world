import { SignalConst } from "../../../const/SignalConst";
import { ChapterBaseData } from "../../../data/ChapterBaseData";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_EffectGfxMgr, G_ResolutionManager, G_SignalManager, G_TutorialManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import StageRewardBoxNode from "./StageRewardBoxNode";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupStageReward extends PopupBase {

    private static StarBoxOpenImg =
        [
            "baoxiangtong_kai",
            "baoxiangyin_kai",
            "baoxiangjin_kai",
        ];

    private static StarBoxEmptyImg =
        [
            "baoxiangtong_kong",
            "baoxiangyin_kong",
            "baoxiangjin_kong",
        ]

    private _chapterData: ChapterBaseData;
    private _star;
    private _panelFinish: cc.Node;
    private _finish: boolean;
    private _callback: Function;
    private _notCallBack: boolean;
    private _boxCount: number;
    private _btnConfirm: CommonButtonLevel0Highlight;

    private _boxDatas: any[];
    private _boxItems: StageRewardBoxNode[];
    private _boxParent: cc.Node;

    init(chapterData: ChapterBaseData, chapterStar, callback) {
        this._chapterData = chapterData;
        this._star = chapterStar;
        this._finish = false;
        this._callback = callback;
        this._notCallBack = false;
        this._boxCount = 0;
        this.node.name = "PopupStageReward";
    }

    public onEnter() {
        this._panelFinish = new cc.Node("_panelFinish");
        this._panelFinish.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelFinish.addComponent(cc.BlockInputEvents);
        this._panelFinish.on(cc.Node.EventType.TOUCH_START, handler(this, this._onFinishTouch));
        this.node.addChild(this._panelFinish);
        this._createEffectNode();
        this._createBoxBtn();
    }

    public onClose() {
        if (G_TutorialManager.isDoingStep(12)) {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'PopupStageReward close');
        }
        if (this._callback && !this._notCallBack) {
            this._callback();
        }
    }

    public onExit() {
    }

    public onBoxGet() {
        let isAllget = true;
        for (let i = 0; i < this._boxDatas.length; i++) {
            let v = this._boxDatas[i];
            if (!v.isAlreadyGet(v)) {
                isAllget = false;
                break;
            }
        }

        for (let i = 0; i < this._boxItems.length; i++) {
            let v = this._boxItems[i];
            v.updateUI();
        }

        if (isAllget) {
            this._btnConfirm.setString(Lang.get('common_btn_sure'));
        }
    }

    private _createActionNode(effect): cc.Node {
        if (effect == 'txt') {
            var txtSp = UIHelper.newSprite(Path.getSystemImage('txt_sys_lingqubaoxiang'));
            return txtSp.node;
        } else if (effect == 'all_bg') {
            var bgSp = UIHelper.newSprite(Path.getPopupReward('img_gain_borad01'));
            return bgSp.node;
        } else if (effect == 'button') {
            let node: cc.Node = new cc.Node("confirmBtn");
            cc.resources.load(Path.getPrefab('CommonButtonLevel0Highlight', 'common'), cc.Prefab, function (err, res) {
                if (err != null || res == null) {
                    return;
                }
                let confirmBtn: CommonButtonLevel0Highlight = cc.instantiate(res).getComponent(CommonButtonLevel0Highlight);
                confirmBtn.setString(Lang.get('stage_one_btn_get'));
                confirmBtn.addClickEventListenerEx(handler(this, this._getReward));
                confirmBtn.setTouchEnabled(true);
                confirmBtn.node.name = ('confirmBtn');
                node.addChild(confirmBtn.node);
                this._btnConfirm = confirmBtn;
            }.bind(this))
            return node;
        } else if (effect == 'txt_meirilibao') {
            return new cc.Node();
        } else if (effect == 'txt_shuoming') {
            return new cc.Node();
        }
    }

    private _createEffectNode() {
        function effectFunction(effect) {
            return this._createActionNode(effect);
        }
        function eventFunction(event, frameIndex, movingNode) {
            if (event == 'finish') {
                this._finish = true;
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupStageReward");
            }
        }
        var node = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_choujiang_hude', effectFunction.bind(this), eventFunction.bind(this), false);
        return node;
    }

    private _onFinishTouch(sender, event) {
    }

    public _getReward() {
        var isAllget = true;
        for (let i = 0; i < this._boxDatas.length; i++) {
            var v = this._boxDatas[i];
            if (!v.isAlreadyGet(v)) {
                isAllget = false;
                break;
            }
        }
        if (isAllget) {
            this.close();
        } else {
            G_UserData.getChapter().c2sGetAllAwardBox(this._chapterData.getId());
            this._notCallBack = true;
        }
    }

    private _getBoxReward(data) {
        if (!data) {
            return;
        }
        if (data.isAlreadyGet(data)) {
            return;
        }
        if (data.type == 'passBox') {
            G_UserData.getChapter().c2sFinishChapterBoxRwd(this._chapterData.getId(), data.id);
        } else if (data.type == 'starBox') {
            G_UserData.getChapter().c2sFinishChapterBoxRwd(this._chapterData.getId(), data.id);
        } else if (data.type == 'stageBox') {
            G_UserData.getChapter().c2sReceiveStageBox(data.id);
        }
    }

    private _createStarRichText(num: number) {
        var paramList = [
            {
                type: 'label',
                text: num.toString(),
                fontSize: 20,
                color: Colors.DARK_BG_THREE,
                anchorPoint: cc.v2(0, 0.5)
            },
            {
                type: 'image',
                texture: Path.getUICommon('img_lit_stars02'),
                filePath: Path.getUICommon('img_lit_stars02'),
                name: 'biantaiStar',
                scale: '0.5'
            },
            {
                type: 'label',
                text: Lang.get('stage_box_normal_name'),
                fontSize: 20,
                color: Colors.DARK_BG_THREE
            }
        ];
        let richText = RichTextExtend.createWithContent(paramList);
        return richText.node;
    }

    private _initBoxData() {
        var configData = this._chapterData.getConfigData();
        var clickHandle: Function = handler(this, this._getBoxReward);
        this._boxDatas = [];
        if (this._chapterData.isLastStagePass() && this._chapterData.getPreward() == 0) {
            var data: any = {};
            data.name = Lang.get('stage_pass_box');
            data.emptyImagePath = Path.getChapterBox('btn_common_box6_3');
            data.fullImagePath = Path.getChapterBox('btn_common_box6_2');
            data.type = 'passBox';
            data.id = 4;
            data.isAlreadyGet = function () {
                return this._chapterData.getPreward() != 0;
            }.bind(this);
            data.clickCallback = clickHandle;
            this._boxDatas.push(data);
        }
        if (configData.copperbox_star != 0 && this._star >= configData.copperbox_star && this._chapterData.getBreward() == 0) {
            var data: any = {};
            data.richNode = this._createStarRichText(configData.copperbox_star);
            data.emptyImagePath = Path.getChapterBox('baoxiangtong_kong');
            data.fullImagePath = Path.getChapterBox('baoxiangtong_kai');
            data.type = 'starBox';
            data.id = 1;
            data.isAlreadyGet = function () {
                return this._chapterData.getBreward() != 0;
            }.bind(this);
            data.clickCallback = clickHandle;
            this._boxDatas.push(data);
        }
        if (configData.silverbox_star != 0 && this._star >= configData.silverbox_star && this._chapterData.getSreward() == 0) {
            var data: any = {};
            data.richNode = this._createStarRichText(configData.silverbox_star);
            data.emptyImagePath = Path.getChapterBox('baoxiangyin_kong');
            data.fullImagePath = Path.getChapterBox('baoxiangyin_kai');
            data.type = 'starBox';
            data.id = 2;
            data.isAlreadyGet = function () {
                return this._chapterData.getSreward() != 0;
            }.bind(this);
            data.clickCallback = clickHandle;
            this._boxDatas.push(data);
        }
        if (configData.goldbox_star != 0 && this._star >= configData.goldbox_star && this._chapterData.getGreward() == 0) {
            var data: any = {};
            data.richNode = this._createStarRichText(configData.goldbox_star);
            data.emptyImagePath = Path.getChapterBox('baoxiangjin_kong');
            data.fullImagePath = Path.getChapterBox('baoxiangjin_kai');
            data.type = 'starBox';
            data.id = 3;
            data.isAlreadyGet = function () {
                return this._chapterData.getGreward() != 0;
            }.bind(this);
            data.clickCallback = clickHandle;
            this._boxDatas.push(data);
        }
        var stageList = this._chapterData.getStageIdList();
        for (let i = 0; i < stageList.length; i++) {
            var stageData = G_UserData.getStage().getStageById(stageList[i]);
            var configData = stageData.getConfigData();
            if (configData.box_id != 0 && stageData) {
                var isget = stageData.isReceive_box();
                if (!isget) {
                    var data: any = {};
                    data.name = Lang.get('stage_box');
                    data.emptyImagePath = Path.getChapterBox('img_mapbox_kong');
                    data.fullImagePath = Path.getChapterBox('img_mapbox_kai');
                    data.type = 'stageBox';
                    data.id = stageList[i];
                    data.isAlreadyGet = function (data) {
                        var stageData = G_UserData.getStage().getStageById(data.id);
                        if (stageData && stageData.isReceive_box()) {
                            return true;
                        }
                        return false;
                    }.bind(this);
                    data.clickCallback = clickHandle;
                    this._boxDatas.push(data);
                }
            }
        }
    }

    private _createBoxBtn() {
        this._initBoxData();
        let gap = 120;
        this._boxParent = new cc.Node("_boxParent");
        this._boxParent.x = (-1 * (this._boxDatas.length - 1) * gap / 2);
        cc.resources.load(Path.getPrefab("StageRewardNode", "stage"), cc.Prefab, (err, res) => {
            if (err != null || res == null || !this.isValid || !this.node) {
                return;
            }
            let nodeBox: cc.Node = cc.instantiate(res);
            this.node.addChild(nodeBox,2);
            let boxNode: cc.Node = nodeBox.getChildByName('BoxParent');
            if (boxNode) {
                boxNode.addChild(this._boxParent);
            }
        });


        cc.resources.load(Path.getPrefab("StageRewardBoxNode", "stage"), cc.Prefab, (err, res) => {
            if (err != null || res == null || !this.isValid || !this._boxDatas) {
                return;
            }
            this._loadStageRewardBoxNodeComplete(res);
        });

    }

    private _loadStageRewardBoxNodeComplete(res) {
        let stageRewardBoxNodePrefab: cc.Node = res;
        let gap = 120;
        this._boxItems = [];
        for (let i = 0; i < this._boxDatas.length; i++) {
            var v = this._boxDatas[i];
            var box = cc.instantiate(stageRewardBoxNodePrefab).getComponent(StageRewardBoxNode);
            this._boxParent.addChild(box.node);
            box.init(v);
            box.updateUI();
            box.node.x = (i * gap);
            this._boxItems.push(box);
        }
    }
}