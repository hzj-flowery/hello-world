import { OnceSignal } from "./OnceSignal";

export class Signal extends OnceSignal
{
    constructor(...value)
    {
        super(value);
    }

    public add(listener)
    {
        return this.registerListener(listener);
    }
}