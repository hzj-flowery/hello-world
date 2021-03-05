import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Lang } from "../../../lang/Lang";
import CommonButton from "../../../ui/component/CommonButton";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { handler } from "../../../utils/handler";
import { table } from "../../../utils/table";
import UIHelper from "../../../utils/UIHelper";
import TacticsView from "./TacticsView";
const { ccclass, property } = cc._decorator;

@ccclass
export class TacticsStudyModule extends cc.Component {
    private _parentView: TacticsView;
    private _target: cc.Node;
    private _onClickStudy: any;
    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    }) _nodeTitle: CommonDetailTitleWithBg = null;
    @property({
        type: cc.Node,
        visible: true
    }) _nodeDesc: any = null;
    @property({
        type: cc.Sprite,
        visible: true
    }) _imgBtnBg: cc.Sprite = null;
    @property({
        type: cc.Node,
        visible: true
    }) _btnStudy: cc.Node = null;
    ctor(parentView, target: cc.Node, studyCallback) {
        this._parentView = parentView;
        this._target = target;
        this._onClickStudy = studyCallback;
        UIHelper.addClickEventListenerEx(this._btnStudy, handler(this, this._onButtonStudyClicked));
        this.init();
    }
    init() {
        this._nodeTitle.setFontSize(24);
        this._nodeTitle.setTitle(Lang.get('tactics_title_study'));
    }
    updateInfo(tacticsUnitData) {
        this._nodeDesc.removeAllChildren();
        var config = tacticsUnitData.getStudyConfig();
        var camp = config.camp;
        var campStr = Lang.get('avatar_book_country_tab_' + camp);
        var list = [];
        for (var i = 1; i <= 3; i++) {
            var color = config['color' + i];
            var proficiency = config['proficiency' + i];
            if (color > 0 && proficiency > 0) {
                var colorStr = Lang.get('common_color_desc_' + color);
                var richText = Lang.get('tactics_study_description', {
                    color: colorStr,
                    country: campStr,
                    proficiency: proficiency / 10
                });
                var label = RichTextExtend.createWithContent(richText);
                label.node.setPosition(cc.v2(0, 0));
                this._nodeDesc.addChild(label.node);
                table.insert(list, label);
            }
        }
        var count = list.length;
        if (count == 1) {
            list[0].node.y = (-8);
        } else if (count == 2) {
            list[0].node.y =(10);
            list[1].node.y =(-20);
        } else {
            list[0].node.y =(22);
            list[1].node.y =(-8);
            list[2].node.y =(-38);
        }
    }
    _onButtonStudyClicked() {
        if (this._onClickStudy) {
            this._onClickStudy();
        }
    }
    setVisible(visible) {
        this._target.active = (visible);
    }
}