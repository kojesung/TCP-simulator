import BaseSimulator from './BaseSimulator.js';
import { EVENT_TYPE, TCP } from './constants.js';
import Event from './Event.js';
import PacketFragments from './PacketFragments.js';
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
                this.#sendProbePacket(sentCount);
                continue;
            }

            const willSend = Math.min(canSendPacketCount, this.packets.length - sentCount);

            this.sendPacketsAsMuchAsRwnd(willSend, sentCount);
            sentCount += willSend;
        }
    }

    #sendProbePacket(sentCount) {
        const nextSeq = this.packets[sentCount].startSeq;

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
        const sendStartTime = this.currentTime;
        let decidedPackets = [];

        // 한번에 보낼 수 있는 만큼의 패킷 운명 정하기
        for (let i = 0; i < canSendPacketCount; i++) {
            const packet = this.packets[sentCount + i];
            const isLost = RandomGenerator.isPacketLost(this.lossRate);
            decidedPackets.push({ packet, isLost });
        }

        // 운명 정해진 애들 실행
        for (let i = 0; i < decidedPackets.length; i++) {
            const { packet, isLost } = decidedPackets[i];
            this.timeline.addEvent(
                new Event(this.currentTime, EVENT_TYPE.PACKET_SEND, {
                    packet,
                    rwnd: this.rwnd,
                })
            );

            if (isLost) {
                this.#planPacketLossInWindow(decidedPackets, i, this.currentTime, packet);
            } else if (!isLost) {
                this.#planPacketSuccessInWindow(decidedPackets, i, this.currentTime, packet);
            }
            this.currentTime += 1; // 한번에 보내는 패킷간 1ms 간격
        }

        this.currentTime = sendStartTime + this.rtt * 2;

        this.#updateRwnd(canSendPacketCount * TCP.MSS);
    }

    #updateRwnd(sentBytes) {
        this.bufferedBytes += sentBytes;

        const processed = Math.min(this.receiverSpeed, this.bufferedBytes);
        this.bufferedBytes -= processed;

        this.rwnd = this.initialBufferSize - this.bufferedBytes;
    }

    #planPacketLossInWindow(windowPackets, indexInWindow, sentTime, packet) {
        let duplicateCount = 0;
        for (let i = indexInWindow + 1; i < windowPackets.length; i++) {
            if (!windowPackets[i].isLost) duplicateCount++;
        }

        if (duplicateCount >= 3) {
            const fastRetransmitTime = sentTime + this.rtt + 3;
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
            // timeout
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

    #planPacketSuccessInWindow(windowPackets, indexInWindow, sentTime, packet) {
        // 현재 윈도우에서 가장 먼저 손실된 패킷 찾기
        let firstLostPacket = null;
        for (let i = 0; i < indexInWindow; i++) {
            if (windowPackets[i].isLost) {
                firstLostPacket = windowPackets[i].packet;
                break;
            }
        }

        const arriveTime = sentTime + this.rtt / 2;
        this.timeline.addEvent(new Event(arriveTime, EVENT_TYPE.PACKET_ARRIVE, { packet }));

        const ackTime = arriveTime + this.rtt / 2;

        if (firstLostPacket) {
            this.timeline.addEvent(
                new Event(ackTime, EVENT_TYPE.DUPLICATE_ACK, {
                    ack: firstLostPacket.startSeq,
                })
            );
        } else {
            this.timeline.addEvent(
                new Event(ackTime, EVENT_TYPE.DATA_ACK_ARRIVE, {
                    ack: packet.endSeq + 1,
                })
            );
        }
    }

    async _executeEvent(event) {
        switch (event.type) {
            case EVENT_TYPE.DUPLICATE_ACK:
                console.log(`[${event.time}ms] ⚠️ Duplicate ACK 발생: ${event.data.ack}`);
                return;

            case EVENT_TYPE.FAST_RETRANSMIT:
                console.log(
                    `[${event.time}ms] 3 Duplicate ACK로 인한 Fast Retransmit: ${event.data.packet.getPacketInfo()}`
                );
                return;

            case EVENT_TYPE.RWND_PROBE:
                console.log(
                    `[${event.time}ms] RWND 자리가 생겼는지 Probe 시작 (seq=${event.data.seq}, rwnd=${event.data.rwnd}B)`
                );
                return;
        }

        await super._executeEvent(event);
    }
}

export default FlowControlSimulator;
