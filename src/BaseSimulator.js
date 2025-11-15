import { EVENT_TYPE, SPEED_MODE } from './constants.js';
import Event from './Event.js';
import Timeline from './Timeline.js';

class BaseSimulator {
    constructor(totalDataSize, lossRate, rtt, speed) {
        this.totalDataSize = totalDataSize;
        this.lossRate = lossRate;
        this.rtt = rtt;
        this.speed = speed;
        this.timeline = new Timeline();
        this.packets = [];
        this.currentTime = 0;
        this.isn = this._generateISN();
    }

    _generateISN() {
        return Math.floor(Math.random() * 9000) + 1000;
    }

    _threeWayHandshake() {
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

    _sendPackets() {
        throw new Error('[ERROR] _sendPackets()는 자식 class에서 구현해야합니다.');
    }

    _detectLossType(windowPackets, lostIndex) {
        let duplicateCount = 0;

        for (let i = lostIndex + 1; i < windowPackets.length; i++) {
            if (!windowPackets[i].isLost) {
                duplicateCount++;
            }
        }

        return duplicateCount >= 3 ? 'FAST_RETRANSMIT' : 'TIMEOUT';
    }

    _createRetransmitEvents(packet, retransmitTime) {
        this.timeline.addEvent(new Event(retransmitTime, EVENT_TYPE.RETRANSMIT, { packet }));

        const arriveTime = retransmitTime + this.rtt / 2;
        this.timeline.addEvent(new Event(arriveTime, EVENT_TYPE.PACKET_ARRIVE, { packet }));

        const ackTime = arriveTime + this.rtt / 2;
        this.timeline.addEvent(
            new Event(ackTime, EVENT_TYPE.DATA_ACK_ARRIVE, {
                ack: packet.endSeq + 1,
            })
        );
    }

    _fourWayHandshake() {
        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_SEND));
        this.currentTime += this.rtt / 2;

        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_ARRIVE));
        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_ACK_SEND));
        this.currentTime += this.rtt / 2;

        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_ACK_ARRIVE));

        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_SEND));
        this.currentTime += this.rtt / 2;

        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_ARRIVE));
        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_ACK_SEND));
        this.currentTime += this.rtt / 2;

        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_ACK_ARRIVE));
    }

    planSimulation() {
        this.currentTime = 0;
        this._threeWayHandshake();
        this._sendPackets();
        this._fourWayHandshake();
        this.timeline.sort();
    }

    async run() {
        const events = this.timeline.getEvents();
        let runTime = 0;

        for (const event of events) {
            await this.#wait(event.time - runTime);
            runTime = event.time;

            await this._executeEvent(event);
        }
    }

    async #wait(ms) {
        let actualDelay;
        if (this.speed === SPEED_MODE.INSTANT) {
            return;
        } else if (this.speed === SPEED_MODE.FAST) {
            actualDelay = ms * 0.1;
        } else if (this.speed === SPEED_MODE.SLOW) {
            actualDelay = ms;
        }
        if (actualDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, actualDelay));
        }
    }

    async _executeEvent(event) {
        // TODO 추후에 출력 포매터로 분리
        switch (event.type) {
            case EVENT_TYPE.SYN_SEND:
                console.log('\n[3-way handshake 연결 시작]');
                console.log(`[${event.time}ms] SYN → (seq=${event.data.seq})`);
                break;

            case EVENT_TYPE.SYN_ACK_ARRIVE:
                console.log(`[${event.time}ms] ← SYN-ACK (ack=${event.data.ack})`);
                break;

            case EVENT_TYPE.ACK_SEND:
                console.log(`[${event.time}ms] ACK →`);
                console.log('3-way handshake 연결 완료!\n');
                console.log('⚡️⚡️⚡️데이터 전송⚡️⚡️⚡️');
                console.log(
                    `전송할 전체 데이터의 크기: ${this.totalDataSize} bytes (${this.packets.length} packets)\n`
                );
                break;

            case EVENT_TYPE.PACKET_SEND:
                console.log(`[${event.time}ms] Send: ${event.data.packet.getPacketInfo()}`);
                break;

            case EVENT_TYPE.DATA_ACK_ARRIVE:
                console.log(`[${event.time}ms] ← ACK ${event.data.ack}\n`);
                break;

            case EVENT_TYPE.TIMEOUT:
                console.log(
                    `[${event.time}ms] ⏰ Timeout 발생!(RTT*2 시간동안 ACK가 오지 않았음): Packet#${event.data.packet.id}`
                );
                break;

            case EVENT_TYPE.RETRANSMIT:
                console.log(`[${event.time}ms] 🔄 Retransmit: ${event.data.packet.getPacketInfo()}`);
                break;

            case EVENT_TYPE.FIN_SEND:
                const finEvents = this.timeline.getEvents().filter((e) => e.type === EVENT_TYPE.FIN_SEND);
                if (event === finEvents[0]) {
                    console.log('\n4-way handshake 연결 종료 시작');
                }
                console.log(`[${event.time}ms] FIN →`);
                break;

            case EVENT_TYPE.FIN_ARRIVE:
                console.log(`[${event.time}ms] ← FIN`);
                break;

            case EVENT_TYPE.PACKET_LOSS:
                console.log(`🚨🚨🚨Packet#${event.data.id} loss 발생🚨🚨🚨`);
                break;

            case EVENT_TYPE.FIN_ACK_ARRIVE:
                console.log(`[${event.time}ms] ← ACK`);
                const finAckEvents = this.timeline.getEvents().filter((e) => e.type === EVENT_TYPE.FIN_ACK_ARRIVE);
                if (event === finAckEvents[finAckEvents.length - 1]) {
                    console.log('⛓️‍💥⛓️‍💥⛓️‍💥연결 종료⛓️‍💥⛓️‍💥⛓️‍💥!\n');
                }
                break;
        }
    }
}

export default BaseSimulator;
