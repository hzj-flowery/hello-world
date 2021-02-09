import { ConfigNameConst } from "../../../const/ConfigNameConst";
import ParameterIDConst, { G_ParameterIDConst } from "../../../const/ParameterIDConst";
import { Colors, G_ConfigLoader, G_UserData } from "../../../init";
import CommonHeadFrame from "../../../ui/component/CommonHeadFrame";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import ViewBase from "../../ViewBase";
import { MineCraftHelper } from "../mineCraft/MineCraftHelper";
import GrainCarBar from "./GrainCarBar";
const {ccclass, property} = cc._decorator;
@ccclass
export default class  GrainCarAttackLeftPanel extends ViewBase{

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon: CommonHeroIcon = null;

    @property({
        type: CommonHeadFrame,
        visible: true
    })
    _commonFrame: CommonHeadFrame = null;
    
    @property({
        type: GrainCarBar,
        visible: true
    })
    _barArmy: GrainCarBar = null;
    
    @property({
        type: cc.Label,
        visible: true
    })
    _playerName: cc.Label = null;
    
    onCreate(){
        
    }
    onEnter() {
    }
    onExit() {
    }
    updateUI(army) {
        this._updateNodeIcon();
        this._updateHeadFrame();
        this._updateNameArmy(army);
    }
    _updateNodeIcon() {
        var avatarBaseId = G_UserData.getBase().getAvatar_base_id();
        var id = G_UserData.getHero().getRoleBaseId();
        var avatarData = {
            baseId: G_UserData.getHero().getRoleBaseId(),
            avatarBaseId: avatarBaseId,
            covertId: UserDataHelper.convertToBaseIdByAvatarBaseId(avatarBaseId, id)[0],
            isHasAvatar: avatarBaseId && avatarBaseId > 0
        };
        if (avatarData.covertId != null && avatarData.covertId != 0) {
            this._fileNodeIcon.onLoad();
            this._fileNodeIcon.updateIcon(avatarData);
            this._fileNodeIcon.setIconMask(false);
        }
}
    _updateHeadFrame() {
        (this['_commonFrame'] as CommonHeadFrame).updateUI(G_UserData.getBase().getHead_frame_id(), this._fileNodeIcon.node.scale);
    }
    _updateNameArmy(army) {
        this['_playerName'].string = (G_UserData.getBase().getName());
        this['_playerName'].node.color = (Colors.getOfficialColor(G_UserData.getBase().getOfficer_level()));
        var maxArmy = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.TROOP_MAX).content);
        if (G_UserData.getMineCraftData().isSelfPrivilege()) {
            var soilderAdd = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_SOILDERADD);
            maxArmy = maxArmy + soilderAdd;
        }
        this._barArmy.updateBarWithValue(army, maxArmy);
    }
};