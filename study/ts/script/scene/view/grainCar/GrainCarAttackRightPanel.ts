import { Lang } from "../../../lang/Lang";
import CommonGrainCarIcon from "../../../ui/component/CommonGrainCarIcon";
import ViewBase from "../../ViewBase";
import GrainCarBar from "./GrainCarBar";


const {ccclass, property} = cc._decorator;
@ccclass
export default class GrainCarAttackRightPanel extends ViewBase{

    
    @property({
        type: CommonGrainCarIcon,
        visible: true
    })
    _fileNodeIcon: CommonGrainCarIcon = null;

      
    @property({
        type: GrainCarBar,
        visible: true
    })
    _barArmy: GrainCarBar = null;
    
    @property({
        type: cc.Label,
        visible: true
    })
    _guildName: cc.Label = null;
    
    onCreate(){

    }
    onEnter() {
    }
    onExit() {
    }
    updateUI(carUnit) {
        this._updateNodeIcon(carUnit);
        this._updateHp(carUnit);
    }
    _updateNodeIcon(carUnit) {
         this._fileNodeIcon.updateUI(carUnit);
    }
    _updateHp(carUnit) {
        this._guildName.string = (carUnit.getGuild_name() + (Lang.get('grain_car_guild_de') + carUnit.getConfig().name));
        this._barArmy.updateBarWithCarUnit(carUnit);
    }
};