import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_EffectGfxMgr, G_SceneManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import PopupBoxReward from "../../../ui/popup/PopupBoxReward";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChapterBox extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnBg: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnBox: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _boxNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _chapterName: cc.Label = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBarProgress: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textProgress: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;


    private _boxInfo;
    private _effect:cc.Node;

    public onLoad() {
        this._redPoint.node.active = (false);
        this.updateUI();
    }

    public updateUI() {
        this._boxInfo = G_UserData.getChapterBox().getCurBoxInfo();
        if (this._boxInfo) {
            var lastChapterID = G_UserData.getChapter().getLastOpenChapterId();
            this._chapterName.string = (this._boxInfo.config.title);
            if (G_UserData.getChapterBox().isCurBoxAwardsCanGet()) {
                this._loadingBarProgress.progress = 1;
                this._textProgress.string = '%d/%d'.format(this._boxInfo.config.chapter, this._boxInfo.config.chapter);
                this._createBoxEffect();
            } else {
                this._textProgress.string = '%d / %d'.format(lastChapterID - 1, this._boxInfo.config.chapter);
                this._loadingBarProgress.progress = ((lastChapterID - 1) / this._boxInfo.config.chapter);
                this._removeEffect();
            }
        } else {
            this.node.active = (false);
        }
    }

    public setChapterBoxVisible(trueOrFalse) {
        if (this._boxInfo && trueOrFalse) {
            this.node.active = (true);
        } else {
            this.node.active = (false);
        }
    }

    private _createBoxEffect() {
        if (this._effect) {
            return;
        }
        this._btnBox.node.active = (false);
        this._effect = G_EffectGfxMgr.createPlayMovingGfx(this._boxNode, 'moving_boxjump', null, null, false).node;
        this._redPoint.node.active = (true);
    }

    private _removeEffect() {
        if (this._effect) {
            this._effect.destroy();
            this._effect = null;
        }
        this._btnBox.node.active = (true);
        this._redPoint.node.active = (false);
    }

    private _getAward() {
        G_UserData.getChapterBox().c2sGetPeriodBoxAward(this._boxInfo.config.id);
    }

    public onBtnBox(sender) {
        if (!this._boxInfo) {
            return;
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupBoxReward", "common"), (popupBoxReward: PopupBoxReward) => {
            popupBoxReward.init(Lang.get('chapter_box_pop_title'), handler(this, this._getAward), false, false);
            var rewards = [{
                type: this._boxInfo.config.type,
                value: this._boxInfo.config.value,
                size: this._boxInfo.config.size
            }];
            popupBoxReward.updateUI(rewards);
            popupBoxReward.openWithAction();
            popupBoxReward.setBtnText(Lang.get('get_box_reward'));
            var chapterData = G_UserData.getChapter().getChapterDataById(this._boxInfo.config.chapter);
            var configData = chapterData.getConfigData();
            var label = RichTextExtend.createWithContent(Lang.get('chapter_box_pop_detail', { chapter: '%s %s'.format(configData.chapter, configData.name) }));
            popupBoxReward.addRichTextDetail(label.node);
            if (G_UserData.getChapterBox().isCurBoxAwardsCanGet()) {
                popupBoxReward.setDetailTextVisible(false);
            } else {
                popupBoxReward.setBtnEnable(false);
                var lastChapterID = G_UserData.getChapter().getLastOpenChapterId();
                var leftNum = this._boxInfo.config.chapter + 1 - lastChapterID;
                popupBoxReward.setDetailTextString(Lang.get('chapter_box_pop_detail2', { num: leftNum }));
                popupBoxReward.setDetailTextToBottom();
                popupBoxReward.setDetailTextVisible(true);
            }
        })
    }
}