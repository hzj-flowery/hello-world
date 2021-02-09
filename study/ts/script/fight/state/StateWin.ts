import { State } from "./State";
import UnitHero from "../unit/UnitHero";

export class StateWin extends State {
    public start() {
        super.start();
        this.cName = "StateWin";
        (this.entity as UnitHero).playWinAction();
        this.entity.setTowards(this.entity.camp);
    }
}