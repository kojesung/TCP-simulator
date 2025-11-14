import BaseSimulator from './BaseSimulator.js';
import { EVENT_TYPE, TCP } from './constants.js';
import Event from './Event.js';
import PacketFragments from './PacketFragments';
import RandomGenerator from './RandomGenerator.js';

class FlowControlSimulator extends BaseSimulator {
    constructor(totalDataSize, lossRate, rtt, speed, receiverBufferSize, receiverSpeed) {
        super(totalDataSize, lossRate, rtt, speed);

        this.initialBufferSize = receiverBufferSize;
        this.rwnd = receiverBufferSize;
        this.receiverSpeed = receiverSpeed;
        this.bufferedBytes = 0;

        this.lastAck = this.isn + 1;
        this.duplicateAckCount = 0;
    }
    _sendPackets() {
        this.packets = PacketFragments.getFragmentedPackets(this.totalDataSize, this.isn + 1);

        let sentCount = 0;

        while (sentCount < this.packets.length) {
            const canSendPacketCount = Math.floor(this.rwnd / TCP.MSS);

            if (canSendPacketCount === 0) {
                this.sendProbePacket();
                continue;
            }

            // TODO 보낼 수 있는 만큼 보내는 함수(canSendPacketCount, sentCount)
            sentCount += 1;
        }
    }
    sendProbePacket() {
        const nextSeq = this.packets.length > 0 ? this.packets[this.packets.length - 1].endSeq + 1 : this.isn + 1;

        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.RWND_PROBE, {
                seq: nextSeq,
                rwnd: this.rwnd,
                buffered: this.bufferedBytes,
            })
        );

        this.currentTime += this.rtt;

        const processed = Math.min(this.receiverSpeed, this.bufferedBytes); // 처리해야될게 rtt당 처리하는 bytes보다 적을 때를 고려
        this.bufferedBytes -= processed;

        this.rwnd = this.initialBufferSize - this.bufferedBytes;

        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.RWND_UPDATE, {
                rwnd: this.rwnd,
                buffered: this.bufferedBytes,
            })
        );
    }

    // rwnd만큼만 보내는 메서드
    sendPacketsAsMuchAsRwnd(canSendPacketCount, sentCount) {
        let decidedPackets = [];

        // 한번에 보낼 수 있는 만큼의 패킷 운명 정하기
        for (let i = 0; i < canSendPacketCount; i++) {
            const packet = this.packets[startIndex + i];
            const isLost = RandomGenerator.isPacketLost(this.lossRate);
            decidedPackets.push({ packet, isLost });
        }

        // 운명 정해진 애들 실행
        for (let i = 0; i < decidedPackets.length; i++) {
            const { packet, isLost } = decidedPackets[i];

            this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.PACKET_SEND, { packet }));

            if (isLost) {
                this.#planPacketLossInWindow(decidedPackets, i, this.currentTime, packet);
            } else if (!isLost) {
                this.#planPacketSuccessInWindow();
            }
        }
    }

    #planPacketLossInWindow(windowPackets, indexInWindow, sentTime, packet) {
        let duplicateCount = 0;
        for (let i = indexInWindow + 1; i < windowPackets.length; i++) {
            if (!windowPackets[i].isLost) duplicateCount++;
        }

        const baseAckTime = sentTime + this.rtt;

        for (let i = 0; i < duplicateCount; i++) {
            const ackTime = baseAckTime + i + 1;
            this.timeline.addEvent(new Event(ackTime, EVENT_TYPE.DUPLICATE_ACK, { ack: packet.endSeq + 1 }));
        }

        if (duplicateCount >= 3) {
            const fastRetransmitTime = baseAckTime + 3; // 3개의 duplicate ACK를 받은 시점
            this.timeline.addEvent(
                new Event(fastRetransmitTime, EVENT_TYPE.FAST_RETRANSMIT, {
                    packet,
                })
            );

            const retransmitArriveTime = fastRetransmitTime + this.rtt / 2;
            this.timeline.addEvent(
                new Event(retransmitArriveTime, EVENT_TYPE.PACKET_ARRIVE, {
                    packet,
                })
            );

            const retransmitAckTime = retransmitArriveTime + this.rtt / 2;
            this.timeline.addEvent(
                new Event(retransmitAckTime, EVENT_TYPE.DATA_ACK_ARRIVE, {
                    ack: packet.endSeq + 1,
                })
            );
        } else {
            // timeout 시작
            const timeoutTime = sentTime + this.rtt * 2;

            this.timeline.addEvent(
                new Event(timeoutTime, EVENT_TYPE.TIMEOUT, {
                    packet,
                })
            );

            this.timeline.addEvent(
                new Event(timeoutTime, EVENT_TYPE.RETRANSMIT, {
                    packet,
                })
            );

            const arriveTime = timeoutTime + this.rtt / 2;
            this.timeline.addEvent(
                new Event(arriveTime, EVENT_TYPE.PACKET_ARRIVE, {
                    packet,
                })
            );

            const ackTime = arriveTime + this.rtt / 2;
            this.timeline.addEvent(
                new Event(ackTime, EVENT_TYPE.DATA_ACK_ARRIVE, {
                    ack: packet.endSeq + 1,
                })
            );
        }
    }

    #planPacketSuccessInWindow(packet, currentTime) {}
}

export default FlowControlSimulator;
