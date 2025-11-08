import { EVENT_TYPE } from './constants.js';
import Event from './Event.js';
import PacketFragments from './PacketFragments.js';
import Timeline from './Timeline.js';

class BasicSimulator {
    constructor(totalDataSize, lossRate) {
        this.totalDataSize = totalDataSize;
        this.lossRate = lossRate;
        this.timeline = new Timeline();
        this.packets = [];
        this.currentTime = 0;
        this.isn = 0; // TODO 랜덤한 수의 Seq# 생성하는 private 함수 호출
    }

    #threeWayHandshake() {
        const { rtt } = this.config;

        this.timeline.addEvent(
            new Event(0, EVENT_TYPE.SYN_SEND, {
                seq: this.isn,
            })
        );

        this.timeline.addEvent(
            new Event(rtt / 2, EVENT_TYPE.SYN_ARRIVE, {
                seq: this.isn,
            })
        );

        this.timeline.addEvent(
            new Event(rtt / 2, EVENT_TYPE.SYN_ACK_SEND, {
                ack: this.isn + 1,
            })
        );

        this.timeline.addEvent(
            new Event(rtt, EVENT_TYPE.SYN_ACK_ARRIVE, {
                ack: this.isn + 1,
            })
        );

        this.timeline.addEvent(new Event(rtt, EVENT_TYPE.ACK_SEND));
    }
}

export default BasicSimulator;
