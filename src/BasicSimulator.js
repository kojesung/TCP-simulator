import { EVENT_TYPE } from './constants.js';
import Event from './Event.js';
import PacketFragments from './PacketFragments.js';
import RandomGenerator from './RandomGenerator.js';
import Timeline from './Timeline.js';

class BasicSimulator {
    constructor(totalDataSize, lossRate, rtt) {
        this.totalDataSize = totalDataSize;
        this.lossRate = lossRate;
        this.rtt = rtt;
        this.timeline = new Timeline();
        this.packets = [];
        this.currentTime = 0;
        this.isn = 0; // TODO 랜덤한 수의 Seq# 생성하는 private 함수 호출
    }

    #threeWayHandshake() {
        this.timeline.addEvent(
            new Event(0, EVENT_TYPE.SYN_SEND, {
                seq: this.isn,
            })
        );

        this.currentTime += this.rtt / 2;

        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.SYN_ARRIVE, {
                seq: this.isn,
            })
        );

        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.SYN_ACK_SEND, {
                ack: this.isn + 1,
            })
        );

        this.currentTime += this.rtt / 2;

        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.SYN_ACK_ARRIVE, {
                ack: this.isn + 1,
            })
        );

        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.ACK_SEND));
    }

    #sendFragmentedPackets() {
        this.packets = PacketFragments.getFragmentedPackets(this.totalDataSize, this.isn + 1);

        this.packets.forEach((packet) => {
            this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.PACKET_SEND, { packet }));

            const isLost = RandomGenerator.isPacketLost(this.lossRate);

            if (isLost) return null; // TODO packet loss시 로직 추가
            else if (!isLost) return null; // TODO packet 전송 성공시 로직 추가
        });
    }
}

export default BasicSimulator;
