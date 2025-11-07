class Timeline {
    constructor() {
        this.events = [];
    }
    addEvent(event) {
        this.events.push(event);
    }
    getEvents() {
        return this.events;
    }
    sort() {
        this.events.sort((a, b) => a.time - b.time);
    }
}
export default Timeline;
