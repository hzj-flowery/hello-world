export class StatisticsData {
    public type = 0;
    count = 0;
    description = "";

    public getDescription() {
        return this.description;
    }

    public getCount() {
        return this.count;
    }

    public getType() {
        return this.type;
    }

    constructor(type, description) {
        this.type = type;
        this.description = description;
    }

    public clear() {

    }

    public addCount(count) {
        this.count += count;
    }
}