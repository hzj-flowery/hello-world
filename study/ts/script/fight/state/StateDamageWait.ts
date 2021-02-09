import Entity from "../unit/Entity";
import { FightConfig } from "../FightConfig";
import { StateIdle } from "./StateIdle";
import UnitHero from "../unit/UnitHero";

export class StateDamageWait extends StateIdle {
    private buffSound;
    private spine;
    private time;
    private action: string;

    private startTime: number;

    constructor(entity: Entity, buffConfig) {
        super(entity);
        this.cName = "StateDamageWait";
        let config = buffConfig;
        this.buffSound = config.buff_sound;
        this.spine = config.buff_front_effect;
        this.time = config.buff_blow_time;
        this.action = "effect";

        if (config.buff_type == FightConfig.FLASH_BUFF_ID || config.buff_type == FightConfig.FLASH_BUFF_ID2) {
            this.action = FightConfig.getFlashAction(this.entity.country);
        }
        this.startTime = 0;
    }

    public start() {
        super.start();
        (this.entity as UnitHero).playSpineEffect(this.spine, this.action, this.buffSound);
    }

    public update(f: number) {
        if (this.startTime * 1000 > this.time) {
            this.onFinish();
        }
        this.startTime += f;
    }
}