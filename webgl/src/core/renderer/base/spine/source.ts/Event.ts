export class Event {
    public time:any;
    public data:any;
    constructor(time, data) {
        if (data == null)
            throw new Error("data cannot be null.");
        this.time = time;
        this.data = data;
    }
}