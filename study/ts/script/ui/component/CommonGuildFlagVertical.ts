import CommonGuildFlag from "./CommonGuildFlag";
import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonGuildFlagVertical extends CommonGuildFlag {
    getImagePath(index) {
        return Path.getGuildVerticalFlagImage(index);
    }

}