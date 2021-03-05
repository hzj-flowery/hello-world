const { ccclass, property } = cc._decorator;

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import { handler } from '../../../utils/handler';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { SeasonSportConst } from '../../../const/SeasonSportConst';

@ccclass
export default class SeasonDailyRewardsCell extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resource: cc.Node = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeIcon: CommonIconTemplate = null;

    @property({ type: cc.Label, visible: true })
    _textItemName: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _textFightCount: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeRichText: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageReceive: cc.Sprite = null;

    @property({ type: CommonButtonSwitchLevel1, visible: true })
    _btnGetAward: CommonButtonSwitchLevel1 = null;

    private _customCallback;
    private _data;

    public onLoad() {
        this._updateSize();
        this._btnGetAward.addClickEventListenerEx(handler(this, this._onBtnGetAward));
    }

    private _updateSize() {
        var size = this._resource.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    private _onBtnGetAward(sender) {
        if (this._customCallback) {
            this._customCallback(this._data);
        }
    }

    private _updateDesc(data) {
        this._textFightCount.removeAllChildren();
        if (data.type == 1) {
            var richText = RichTextExtend.createRichTextByFormatString(Lang.get('season_daily_fight', { num: data.num }), {
                defaultColor: Colors.NORMAL_BG_ONE,
                defaultSize: 20,
                other: { 1: { fontSize: 20 } }
            });
            this._textFightCount.addChild(richText.node);
        } else if (data.type == 2) {
            var richText = RichTextExtend.createRichTextByFormatString(Lang.get('season_daily_win', { num: data.num }), {
                defaultColor: Colors.NORMAL_BG_ONE,
                defaultSize: 20,
                other: { 1: { fontSize: 20 } }
            });
            this._textFightCount.addChild(richText.node);
        }
    }

    private _updatePrograss(data) {
        this._nodeRichText.removeAllChildren();
        if (data.state == 1) {
            this._imageReceive.node.active = true;
            this._btnGetAward.node.active = false;
            var richText = RichTextExtend.createRichTextByFormatString(Lang.get('season_daily_finish_richtext', {
                num1: data.num,
                num2: data.num
            }), {
                defaultColor: Colors.NORMAL_BG_ONE,
                defaultSize: 18,
                other: { 1: { fontSize: 18 } }
            });
            this._nodeRichText.addChild(richText.node);
        } else {
            this._btnGetAward.node.active = true;
            this._imageReceive.node.active = false;
            if (data.canGet) {
                this._btnGetAward.setString(Lang.get('customactivity_btn_name_receive'));
                this._btnGetAward.setEnabled(true);
                this._btnGetAward.switchToNormal();
                var richText = RichTextExtend.createRichTextByFormatString(Lang.get('season_daily_finish_richtext', {
                    num1: data.num,
                    num2: data.num
                }), {
                    defaultColor: Colors.NORMAL_BG_ONE,
                    defaultSize: 18,
                    other: { 1: { fontSize: 18 } }
                });
                this._nodeRichText.addChild(richText.node);
            } else {
                var richText = RichTextExtend.createRichTextByFormatString(Lang.get('season_daily_notfinish_richtext', {
                    num1: data.curNum,
                    num2: data.num
                }), {
                    defaultColor: Colors.NORMAL_BG_ONE,
                    defaultSize: 18,
                    other: { 1: { fontSize: 18 } }
                });
                this._nodeRichText.addChild(richText.node);
                this._btnGetAward.setEnabled(false);
            }
        }
    }

    public updateUI(data) {
        if (!data) {
            return;
        }
        this._data = data;
        this._fileNodeIcon.unInitUI();
        this._fileNodeIcon.initUI(SeasonSportConst.SEASON_RES_TYPE, SeasonSportConst.SEASON_RES_VALUE, data.size);
        this._fileNodeIcon.setImageTemplateVisible(true);
        this._btnGetAward.setString(Lang.get('season_daily_buy'));
        var itemParams = this._fileNodeIcon.getItemParams();
        this._textItemName.string = itemParams.name;
        this._textItemName.node.color = (itemParams.icon_color);
        this._updateDesc(data);
        this._updatePrograss(data);
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}