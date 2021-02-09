import { Lang } from "../../../lang/Lang";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import { RichTextExtend } from "../../../extends/RichTextExtend";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TeamYokeAvatarNode extends cc.Component {

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _fileNodeHero: CommonHeroAvatar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeNamePos: cc.Node = null;

    onLoad(){
        console.log("进来啦");
        this._fileNodeHero.init();
    }

    
    updateView(baseId, activatedCount, totalCount, limitLevel, limitRedLevel) {
        this._fileNodeHero.updateUI(baseId, null, null, limitLevel, null, null, limitRedLevel);
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId);
        var name = heroParam.name;
        var desContent = Lang.get('hero_yoke_total_count_des', {
            name: name,
            count1: activatedCount,
            count2: totalCount
        });
        let richText = RichTextExtend.createWithContent(desContent);
        richText.node.setAnchorPoint(new cc.Vec2(0.5, 0.5));
        this._nodeNamePos.removeAllChildren();
        this._nodeNamePos.addChild(richText.node);
    }
}