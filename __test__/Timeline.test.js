import { describe, test, expect } from '@jest/globals';
import Timeline from '../src/Timeline.js';
import Event from '../src/Event.js';
import { EVENT_TYPE } from '../src/constants.js';

describe('Timeline', () => {
    test('이벤트를 추가할 수 있다', () => {
        const timeline = new Timeline();
        const event = new Event(100, EVENT_TYPE.PACKET_SEND, { id: 1 });

        timeline.addEvent(event);

        expect(timeline.getEvents()).toHaveLength(1);
        expect(timeline.getEvents()[0]).toBe(event);
    });

    test('여러 이벤트를 추가할 수 있다', () => {
        const timeline = new Timeline();
        const event1 = new Event(100, EVENT_TYPE.PACKET_SEND, {});
        const event2 = new Event(200, EVENT_TYPE.PACKET_ARRIVE, {});

        timeline.addEvent(event1);
        timeline.addEvent(event2);

        expect(timeline.getEvents()).toHaveLength(2);
    });

    test('sort는 시간 순으로 이벤트를 정렬한다', () => {
        const timeline = new Timeline();
        const event1 = new Event(300, EVENT_TYPE.PACKET_SEND, {});
        const event2 = new Event(100, EVENT_TYPE.PACKET_ARRIVE, {});
        const event3 = new Event(200, EVENT_TYPE.DATA_ACK_ARRIVE, {});

        timeline.addEvent(event1);
        timeline.addEvent(event2);
        timeline.addEvent(event3);
        timeline.sort();

        const events = timeline.getEvents();
        expect(events[0].time).toBe(100);
        expect(events[1].time).toBe(200);
        expect(events[2].time).toBe(300);
    });

    test('같은 시간의 이벤트들도 정렬할 수 있다', () => {
        const timeline = new Timeline();
        timeline.addEvent(new Event(100, EVENT_TYPE.PACKET_SEND, {}));
        timeline.addEvent(new Event(100, EVENT_TYPE.PACKET_ARRIVE, {}));

        timeline.sort();

        expect(timeline.getEvents()).toHaveLength(2);
        expect(timeline.getEvents()[0].time).toBe(100);
        expect(timeline.getEvents()[1].time).toBe(100);
    });
});
