import ListViewCellBase from "../../../ui/ListViewCellBase";
import { EnemyHelper } from "./EnemyHelper";
import { G_ServerTime, Colors } from "../../../init";
import { Util } from "../../../utils/Util";
import { Lang } from "../../../lang/Lang";
import { RichTextExtend } from "../../../extends/RichTextExtend";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FriendEnemyLogCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panel: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _tiembg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _timeStr: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _richTextParent: cc.Node = null;
    
    _startSize: cc.Size;


    onCreate() {
        var size = this._panel.getContentSize();
        this._startSize = size;
    }
    _getLineStr(data) {
        var max = EnemyHelper.getFightSuccessEnergy();
        var localdate = G_ServerTime.getDateObject(data.getFight_time());
        var tStr = Util.format('%02d:%02d:%02d', localdate.getHours(), localdate.getMinutes(), localdate.getSeconds());
        if (data.isWin_type()) {
            if (data.getGrap_value() == 0) {
                return Lang.get('lang_friend_enemy_log_cell_content0', {
                    time: tStr,
                    name: data.getName()
                });
            } else if (data.getGrap_value() < max) {
                return Lang.get('lang_friend_enemy_log_cell_content1', {
                    time: tStr,
                    name: data.getName(),
                    num: data.getGrap_value()
                });
            } else {
                return Lang.get('lang_friend_enemy_log_cell_content2', {
                    time: tStr,
                    name: data.getName(),
                    num: data.getGrap_value()
                });
            }
        } else {
            return Lang.get('lang_friend_enemy_log_cell_content3', {
                time: tStr,
                name: data.getName()
            });
        }
        return '';
    }
    updateUI(data) {
        if (!data) {
            return;
        }
        var size = this._panel.getContentSize();
        this._startSize = size;
        this._timeStr.string = (data.timeStr);
        var widthLimit = this._startSize.width - 1 * this._richTextParent.x;
        var totalHeight = 0;
        for (let k in data.logs) {
            var v = data.logs[k];
            var line = this._getLineStr(v);
            var richtext = RichTextExtend.createRichTextByFormatString(line, {
                defaultColor: Colors.BRIGHT_BG_ONE,
                defaultSize: 20,
                other: {
                    2: {
                        color: Colors.getOfficialColor(v.getOfficer_level()),
                        outlineColor: Colors.getOfficialColorOutlineEx(v.getOfficer_level())
                    }
                }
            });
            //richtext.setVerticalSpace(4);
            //richtext.ignoreContentAdaptWithSize(false);
           // richtext.node.setContentSize(cc.size(widthLimit, 0));
            richtext.maxWidth = widthLimit;
            //richtext.formatText();
            var virtualContentSize = richtext.node.getContentSize();//.getVirtualRendererSize();
            var richtextHeight = virtualContentSize.height + 12;
            richtext.node.setAnchorPoint(cc.v2(0, 1));
            richtext.node.y = (-1 * totalHeight);
            totalHeight = totalHeight + richtextHeight;
            this._richTextParent.addChild(richtext.node);
        }
        this._tiembg.node.y = (this._startSize.height + totalHeight);
        this.node.setContentSize(this._startSize.width, this._startSize.height + totalHeight);
    }    

}
