import BaseSimulator from './BaseSimulator.js';
import { EVENT_TYPE, TCP } from './constants.js';
import Event from './Event.js';
import FlowControlOutputFormatter from './FlowControlOutputFormatter.js';
import PacketFragments from './PacketFragments.js';
import RandomGenerator from './RandomGenerator.js';

class FlowControlSimulator extends BaseSimulator {
    constructor(totalDataSize, lossRate, rtt, speed, receiverBufferSize, receiverSpeed) {
        super(totalDataSize, lossRate, rtt, speed);

        this.formatter = new FlowControlOutputFormatter(this);

        this.initialBufferSize = receiverBufferSize;
        this.rwnd = receiverBufferSize;
        this.receiverSpeed = receiverSpeed;
        this.bufferedBytes = 0;

        this.lastAck = this.isn + 1;
        this.duplicateAckCount = 0;
        this.maxAckTime = 0;
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

        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.WINDOW_SEND_START, {
                windowSize: canSendPacketCount,
                rwnd: this.rwnd,
                rwndPackets: Math.floor(this.rwnd / TCP.MSS),
                startPacketId: this.packets[sentCount].id,
                endPacketId: this.packets[sentCount + canSendPacketCount - 1].id,
            })
        );
        let decidedPackets = [];
        let hasLoss = false;

        // 한번에 보낼 수 있는 만큼의 패킷 운명 정하기
        for (let i = 0; i < canSendPacketCount; i++) {
            const packet = this.packets[sentCount + i];
            const isLost = RandomGenerator.isPacketLost(this.lossRate);
            decidedPackets.push({ packet, isLost });
            if (isLost) hasLoss = true;
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
                this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.PACKET_LOSS, packet));
            } else {
                this.#planPacketSuccessInWindow(decidedPackets, i, this.currentTime, packet);
            }

            this.currentTime += 1;
        }

        if (hasLoss) {
            this.currentTime = Math.max(sendStartTime + this.rtt * 2, this.maxAckTime);
        } else {
            this.currentTime = sendStartTime + this.rtt * 2;
        }

        this.#updateRwnd(canSendPacketCount * TCP.MSS);
    }

    #updateRwnd(sentBytes) {
        this.bufferedBytes += sentBytes;

        const processed = Math.min(this.receiverSpeed, this.bufferedBytes);
        this.bufferedBytes -= processed;

        this.rwnd = this.initialBufferSize - this.bufferedBytes;
    }

    #planPacketLossInWindow(windowPackets, indexInWindow, sentTime, packet) {
        const lossType = this._detectLossType(windowPackets, indexInWindow);

        if (lossType === 'FAST_RETRANSMIT') {
            const fastRetransmitTime = sentTime + this.rtt + 3;
            this.timeline.addEvent(
                new Event(fastRetransmitTime, EVENT_TYPE.FAST_RETRANSMIT, {
                    packet,
                })
            );

            const ackTime = this._createRetransmitEvents(packet, fastRetransmitTime);

            this.maxAckTime = Math.max(this.maxAckTime, ackTime);
        } else {
            // timeout
            const timeoutTime = sentTime + this.rtt * 2;

            this.timeline.addEvent(
                new Event(timeoutTime, EVENT_TYPE.TIMEOUT, {
                    packet,
                })
            );

            const ackTime = this._createRetransmitEvents(packet, timeoutTime);

            this.maxAckTime = Math.max(this.maxAckTime, ackTime);
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
            this.maxAckTime = Math.max(this.maxAckTime, ackTime);
        }
    }
}

export default FlowControlSimulator;
