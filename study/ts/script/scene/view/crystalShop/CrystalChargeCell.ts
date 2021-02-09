const {ccclass, property} = cc._decorator;

import CommonResourceInfoList from '../../../ui/component/CommonResourceInfoList'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { Colors } from '../../../init';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class CrystalChargeCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _btnGetAward: CommonButtonSwitchLevel1 = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceive: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _title: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _mainIcon: CommonIconTemplate = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRichText: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _otherAward: cc.Node = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _resInfoVaule1: CommonResourceInfoList = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _resInfoVaule2: CommonResourceInfoList = null;


    static PAGE_RECHARGE = 2;
    _data: any;


    ctor() {
        UIHelper.addEventListener(this.node, this._btnGetAward._button, 'CrystalChargeCell', '_onBtnGetAward');
    }
    onInit(){
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._btnGetAward.setString(Lang.get('common_btn_name_confirm'));
    }
    onCreate() {
        this.ctor();
    }
    updateUI(data) {
        if (!data) {
            return;
        }
        this._data = data;
        this._title.string = (data.getDescription());
        if (data.isAlreadGet(data.getPage())) {
            this._imageReceive.node.active = (true);
            this._btnGetAward.setVisible(false);
        } else {
            this._btnGetAward.setVisible(true);
            this._imageReceive.node.active = (false);
            if (data.canGet(data.getPage())) {
                this._btnGetAward.switchToNormal();
                this._btnGetAward.setString(Lang.get('customactivity_btn_name_receive'));
            } else {
                this._btnGetAward.switchToHightLight();
                if (data.getIs_function() == 0) {
                    this._btnGetAward.setString(Lang.get('customactivity_btn_name_recharge'));
                } else {
                    this._btnGetAward.setString(Lang.get('lang_crystal_shop_go_to'));
                }
            }
        }
        var awards = data.getAwards();
        var mainAward = awards[0];
        if (mainAward) {
            this._mainIcon.unInitUI();
            this._mainIcon.initUI(mainAward.type, mainAward.value, mainAward.size);
            this._mainIcon.setImageTemplateVisible(true);
        }
        this._showOtherAwards(data);
        this._showProgress(data);
    }
    _showProgress(data) {
        this._nodeRichText.removeAllChildren();
        if (data.getPay_amount() > 0 && !data.isAlreadGet(data.getPage())) {
            if (data.canGet(data.getPage())) {
                if (data.getPage() == CrystalChargeCell.PAGE_RECHARGE) {
                    var richText = RichTextExtend.createRichTextByFormatString(Lang.get('common_remaining_finish_richtext', {
                        num1: data.getValue() - data.getBuy_count(),
                        num2: data.getBuy_size()
                    }), {
                        defaultColor: Colors.BRIGHT_BG_TWO,
                        defaultSize: 20,
                        other: { 1: { fontSize: 20 } }
                    });
                    this._nodeRichText.addChild(richText.node);
                } else {
                    var richText = RichTextExtend.createRichTextByFormatString(Lang.get('common_progress_finish_richtext', {
                        num1: data.getValue(),
                        num2: data.getPay_amount()
                    }), {
                        defaultColor: Colors.BRIGHT_BG_TWO,
                        defaultSize: 20,
                        other: { 1: { fontSize: 20 } }
                    });
                    this._nodeRichText.addChild(richText.node);
                }
            } else {
                if (data.getPage() == CrystalChargeCell.PAGE_RECHARGE) {
                    if (data.getValue() == data.getBuy_count()) {
                        var richText = RichTextExtend.createRichTextByFormatString(Lang.get('common_remaining_notfinish_richtext', {
                            num1: data.getBuy_size() - data.getValue(),
                            num2: data.getBuy_size()
                        }), {
                            defaultColor: Colors.BRIGHT_BG_TWO,
                            defaultSize: 20,
                            other: {
                                1: { fontSize: 20 },
                                2: { fontSize: 20 }
                            }
                        });
                        this._nodeRichText.addChild(richText.node);
                    } else {
                        var richText = RichTextExtend.createRichTextByFormatString(Lang.get('common_remaining_notfinish_richtext', {
                            num1: data.getValue() - data.getBuy_count(),
                            num2: data.getBuy_size()
                        }), {
                            defaultColor: Colors.BRIGHT_BG_TWO,
                            defaultSize: 20,
                            other: {
                                1: { fontSize: 20 },
                                2: { fontSize: 20 }
                            }
                        });
                        this._nodeRichText.addChild(richText.node);
                    }
                } else {
                    var richText = RichTextExtend.createRichTextByFormatString(Lang.get('common_progress_notfinish_richtext', {
                        num1: data.getValue(),
                        num2: data.getPay_amount()
                    }), {
                        defaultColor: Colors.BRIGHT_BG_TWO,
                        defaultSize: 20,
                        other: {
                            1: { fontSize: 20 },
                            2: { fontSize: 20 }
                        }
                    });
                    this._nodeRichText.addChild(richText.node);
                }
            }
        }
    }
    _showOtherAwards(data) {
        var awards = data.getAwards();
        this._otherAward.active = (awards.length >= 2);
        for (var i = 2; i<=3; i++) {
            var t = awards[i-1];
            var nodeName = '_resInfoVaule' + (i - 1);
            if (t) {
                this[nodeName].setVisible(true);
                this[nodeName].updateUI(t.type, t.value, t.size);
            } else {
                this[nodeName].setVisible(false);
            }
        }
    }
    _onBtnGetAward() {
        this.dispatchCustomCallback();
    }    

}
