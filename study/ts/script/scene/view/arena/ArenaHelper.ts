import { G_UserData } from "../../../init";
import { Path } from "../../../utils/Path";
import { Lang } from "../../../lang/Lang";
import CommonUI from "../../../ui/component/CommonUI";

export namespace ArenaHelper{
    export let updateArenaRank = function (node:cc.Node, rank:number) {
        var textRank = null;
        if (rank <= 3 && rank > 0) {
            var imagePath = Path.getArenaUI('img_qizhi0' + rank);
            var topRanK = (node.getChildByName("Image_top_rank") as cc.Node);
            (node.getChildByName("Text_rank") as cc.Node).active = false;
            topRanK.addComponent(CommonUI).loadTexture(imagePath);
            topRanK.active = true;

        } else {
            (node.getChildByName("Image_top_rank") as cc.Node).active = false;
            textRank = (node.getChildByName("Text_rank") as cc.Node);
            var rankDesc = (rank).toString();
            if (rank != 0) {
                textRank.active = true;
                (textRank.getComponent(cc.Label) as cc.Label).string = rankDesc;
            } else {
                rankDesc = Lang.get('arena_rank_zero');
                textRank.active = true;
                (textRank.getComponent(cc.Label) as cc.Label).string = rankDesc;
                (textRank.getComponent(cc.Label) as cc.Label).fontSize = 20;
            }
        }
        return textRank;
    };
    export let getAwardListByRank = function (rank):Array<any> {
        var awardInfo = G_UserData.getArenaData().getRankAward(rank);
        var awardList = [];
        if (awardInfo == null) {
            return [];
        }
        for (var i = 1;i<=3;i++) {
            if (awardInfo['award_type_' + i] > 0) {
                var award:any = {};
                award.type = awardInfo['award_type_' + i];
                award.value = awardInfo['award_value_' + i];
                award.size = awardInfo['award_size_' + i];
                awardList.push(award);
            }
        }
        return awardList;
    };
}