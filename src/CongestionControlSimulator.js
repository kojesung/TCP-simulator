import BaseSimulator from './BaseSimulator.js';
import CongestionControlOutputFormatter from './CongestionControlOutputFormatter.js';
import { CONGESTION_CONTROL, EVENT_TYPE, TCP } from './constants.js';
import Event from './Event.js';
import PacketFragments from './PacketFragments.js';
import RandomGenerator from './RandomGenerator.js';

class CongestionControlSimulator extends BaseSimulator {
    constructor(totalDataSize, lossRate, rtt, speed, initialCwnd = 1) {
        super(totalDataSize, lossRate, rtt, speed);

        this.formatter = new CongestionControlOutputFormatter(this);

        this.cwnd = initialCwnd * TCP.MSS;
        this.ssthresh = Infinity;
        this.state = CONGESTION_CONTROL.SLOW_START;

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
            const willSend = Math.min(canSendPacketCount, this.packets.length - sentCount);

            this.#sendPacketAsMuchAsCwnd(willSend, sentCount);

            sentCount += willSend;
        }
    }

    #sendPacketAsMuchAsCwnd(sendCount, startIndex) {
        const sendStartTime = this.currentTime;

        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.WINDOW_SEND_START, {
                windowSize: sendCount,
                cwnd: this.cwnd,
                cwndPackets: Math.floor(this.cwnd / TCP.MSS),
                ssthresh: this.ssthresh,
                ssthreshPackets: this.ssthresh === Infinity ? '∞' : Math.floor(this.ssthresh / TCP.MSS),
                state: this.state,
                startPacketId: this.packets[startIndex].id,
                endPacketId: this.packets[startIndex + sendCount - 1].id,
            })
        );

        let decidedPackets = [];
        let hasLoss = false;

        for (let i = 0; i < sendCount; i++) {
            const packet = this.packets[startIndex + i];
            const isLost = RandomGenerator.isPacketLost(this.lossRate);
            decidedPackets.push({ packet, isLost });
            if (isLost) hasLoss = true;
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
                this.#planPacketLoss(decidedPackets, i, this.currentTime, packet);
                this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.PACKET_LOSS, packet));
            } else {
                this.#planPacketSuccess(decidedPackets, i, this.currentTime, packet);
            }

            this.currentTime += 1;
        }

        if (hasLoss) {
            this.currentTime = this.maxAckTime;
        } else {
            this.currentTime = sendStartTime + this.rtt * 2;
            this.#updateCwndOnSuccess(sendCount);
        }
    }

    #planPacketLoss(windowPackets, indexInWindow, sentTime, packet) {
        const lossType = this._detectLossType(windowPackets, indexInWindow);
        if (lossType === 'FAST_RETRANSMIT') {
            const fastRetransmitTime = sentTime + this.rtt + 3;
            const oldCwnd = this.cwnd;
            const oldSsthresh = this.ssthresh;

            this.ssthresh = Math.max(Math.floor(this.cwnd / 2), TCP.MSS * 2); // slow start를 위한 촤소 sstresh 보장
            this.cwnd = this.ssthresh + 3 * TCP.MSS;
            this.state = CONGESTION_CONTROL.FAST_RECOVERY;

            this.timeline.addEvent(
                new Event(fastRetransmitTime, EVENT_TYPE.FAST_RECOVERY, {
                    oldCwnd,
                    oldSsthresh,
                    newSsthresh: this.ssthresh,
                    newCwnd: this.cwnd,
                    packet,
                })
            );

            this.timeline.addEvent(
                new Event(fastRetransmitTime, EVENT_TYPE.FAST_RETRANSMIT, {
                    packet,
                })
            );

            const ackTime = this._createRetransmitEvents(packet, fastRetransmitTime);

            this.state = CONGESTION_CONTROL.CONGESTION_AVOIDANCE;
            this.cwnd = this.ssthresh;
            this.timeline.addEvent(
                new Event(ackTime, EVENT_TYPE.STATE_CHANGE, {
                    from: CONGESTION_CONTROL.FAST_RECOVERY,
                    to: CONGESTION_CONTROL.CONGESTION_AVOIDANCE,
                    cwnd: this.cwnd,
                    ssthresh: this.ssthresh,
                })
            );

            this.maxAckTime = Math.max(this.maxAckTime, ackTime);
        } else if (lossType === 'TIMEOUT') {
            const retransmitTIme = sentTime + this.rtt * 2;
            const oldCwnd = this.cwnd;
            const oldSsthresh = this.ssthresh;

            this.ssthresh = this.cwnd / 2;
            this.cwnd = TCP.MSS;
            this.state = CONGESTION_CONTROL.SLOW_START;

            this.timeline.addEvent(
                new Event(retransmitTIme, EVENT_TYPE.TIMEOUT_CONGESTION, {
                    oldCwnd,
                    oldSsthresh,
                    newSsthresh: this.ssthresh,
                    newCwnd: this.cwnd,
                    packet,
                })
            );

            this.timeline.addEvent(
                new Event(retransmitTIme, EVENT_TYPE.RETRANSMIT, {
                    packet,
                })
            );

            const ackTime = this._createRetransmitEvents(packet, retransmitTIme);
            this.maxAckTime = Math.max(this.maxAckTime, ackTime);
        }
    }

    #planPacketSuccess(windowPackets, indexInWindow, sentTime, packet) {
        let firstLossInWindow = null;
        for (let i = 0; i < indexInWindow; i++) {
            if (windowPackets[i].isLost) {
                firstLossInWindow = windowPackets[i].packet;
                break;
            }
        }

        const arriveTime = sentTime + this.rtt / 2;
        this.timeline.addEvent(new Event(arriveTime, EVENT_TYPE.PACKET_ARRIVE, { packet }));

        const ackTime = arriveTime + this.rtt / 2;
        if (firstLossInWindow) {
            this.timeline.addEvent(
                new Event(ackTime, EVENT_TYPE.DUPLICATE_ACK, {
                    ack: firstLossInWindow.startSeq,
                    packet: firstLossInWindow,
                })
            );
        } else {
            this.timeline.addEvent(new Event(ackTime, EVENT_TYPE.DATA_ACK_ARRIVE, { ack: packet.endSeq + 1 }));
        }

        this.maxAckTime = Math.max(this.maxAckTime, ackTime);
    }

    #updateCwndOnSuccess(sendPacketCount) {
        const oldCwnd = this.cwnd;

        if (this.cwnd < this.ssthresh) {
            this.cwnd += sendPacketCount * TCP.MSS;
            this.state = CONGESTION_CONTROL.SLOW_START;
        } else {
            this.cwnd += TCP.MSS;
            this.state = CONGESTION_CONTROL.CONGESTION_AVOIDANCE;
        }

        if (oldCwnd !== this.cwnd) {
            this.timeline.addEvent(
                new Event(this.currentTime, EVENT_TYPE.CWND_UPDATE, {
                    oldCwnd,
                    newCwnd: this.cwnd,
                    cwndPackets: Math.floor(this.cwnd / TCP.MSS),
                    ssthresh: this.ssthresh,
                    ssthreshPackets: this.ssthresh === Infinity ? '∞' : Math.floor(this.ssthresh / TCP.MSS),
                    state: this.state,
                })
            );
        }
    }
}

export default CongestionControlSimulator;
