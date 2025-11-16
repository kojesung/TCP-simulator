import BaseSimulator from './BaseSimulator.js';
import { EVENT_TYPE, TCP } from './constants.js';
import PacketFragments from './PacketFragments.js';
import RandomGenerator from './RandomGenerator.js';

class CongestionControlSimulator extends BaseSimulator {
    constructor(totalDataSize, lossRate, rtt, speed, initialCwnd = 1) {
        super(totalDataSize, lossRate, rtt, speed);

        this.cwnd = initialCwnd * TCP.MSS;
        this.ssthresh = Infinity;
        this.state = CONGESTION_STATE.SLOW_START;

        this.maxAckTime = 0;
    }

    _sendPackets() {
        this.packets = PacketFragments.getFragmentedPackets(this.totalDataSize, this.isn + 1);

        let sentCount = 0;
        while (sentCount < this.packets.length) {
            const canSendPacketCount = Math.floor(this.cwnd / TCP.MSS);

            if (canSendPacketCount === 0) {
                this.currentTime += this.rtt;
                continue;
            }
            const willSend = Math.min(canSendPackets, this.packets.length - sentCount);

            this.#sendPacketAsMuchAsCwnd(willSend, sentCount);

            sentCount += willSend;
        }
    }

    #sendPacketAsMuchAsCwnd(sendCount, startIndex) {
        let decidedPackets = [];
        for (let i = 0; i < sendCount; i++) {
            packet = this.packets[startIndex + i];
            isLost = RandomGenerator.isPacketLost(this.lossRate);
            decidedPackets.push({ packet, isLost });
        }

        for (let i = 0; i < decidedPackets.length; i++) {
            const { packet, isLost } = decidedPackets[i];

            this.timeline.addEvent(
                new Event(this.currentTime, EVENT_TYPE.PACKET_SEND, {
                    packet,
                    cwnd: this.cwnd,
                    state: this.state,
                })
            );

            if (isLost) {
                this.#planPacketLoss(/*decidedPackets, i, this.currentTime, packet*/);
                this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.PACKET_LOSS, packet));
            } else {
                this.#planPacketSuccess(/*decidedPackets, i, this.currentTime, packet*/);
            }

            this.currentTime += 1;
        }
    }

    #planPacketLoss() {}
    #planPacketSuccess() {}
}

export default CongestionControlSimulator;
