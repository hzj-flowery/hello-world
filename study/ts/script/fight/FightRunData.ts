import UnitHero from "./unit/UnitHero";
import UnitPet from "./unit/UnitPet";
import SceneView from "./scene/SceneView";
import FightScene from "./scene/FightScene";
import { LoopWave } from "./loop/LoopWave";

export class FightRunData {
    private static _instance: FightRunData = null;

    public static get instance(): FightRunData {
        if (this._instance == null) {
            this._instance = new FightRunData();
        }
        return this._instance;
    }

    public units: UnitHero[];
    public pets: UnitPet[];

    private _fightScene: FightScene;
    private _sceneView: SceneView;
    private _loopWave: LoopWave;
    private _battleSpeed: number;

    public setUnits(unitHeroes: UnitHero[]) {
        this.units = unitHeroes;
    }

    public setPets(pets: UnitPet[]) {
        this.pets = pets;
    }

    public getUnits(): UnitHero[] {
        return this.units;
    }

    public getPets(): UnitPet[] {
        return this.pets;
    }

    public setView(sceneView: SceneView) {
        this._sceneView = sceneView;
    }

    public getView(): SceneView {
        return this._sceneView;
    }

    public setScene(fightScene: FightScene) {
        this._fightScene = fightScene;
    }

    public getScene(): FightScene {
        return this._fightScene;
    }

    public setLoopWave(loopWave: LoopWave) {
        this._loopWave = loopWave;
    }

    public getUnitByCell(cell: number): UnitHero {
        for (let i = 0; i < this.units.length; i++) {
            if (this.units[i].cell == cell) {
                return this.units[i];
            }
        }
        return null;
    }

    public getUnitById(id: number): UnitHero {

        for (let i = 0; i < this.units.length; i++) {
            if (this.units[i].stageID == id) {
                return this.units[i];
            }

        }
        return null;
    }

    public getPetByCamp(camp, config): UnitPet {
        for (let i = 0; i < this.pets.length; i++) {
            let pet: UnitPet = this.pets[i];
            if (pet.getCamp() == camp && pet.getConfigId() == config) {
                return pet;
            }
        }
        return null;
    }

    public getAttackIndex() {
        if (this._loopWave == null) {
            return;
        }
        let round = this._loopWave.getLoopRound();
        if (round == null) {
            return;
        }
        return round.getAttackIndex();
    }

    public setBattleSpeed(speed: number) {
        this._battleSpeed = speed;
    }

    public getBattleSpeed(): number {
        return this._battleSpeed;
    }
}