import UIHelper from "./UIHelper";
import { Path } from "./Path";

export default class UICreateHelper {


    static showRedPoint(node, show, posPercent) {
        if (show) {
            var redImg:cc.Node = node.getChildByName('redPoint');
            if (!redImg) {
                redImg = UIHelper.createImage({ texture: Path.getUICommon('img_redpoint') });
                redImg.name = ('redPoint');
                node.addChild(redImg);
                if (posPercent) {
                    UIHelper.setPosByPercent(redImg, posPercent);
                }
            }
            redImg.active = (true);
        } else {
            var redImg1:cc.Node = node.getChildByName('redPoint');
            if (redImg1) {
                redImg1.active = (false);
            }
        }
    };

}
