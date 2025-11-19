import BaseOutputFormatter from './BaseOutputFormatter.js';
import { EVENT_TYPE } from './constants.js';

class FlowControlOutputFormatter extends BaseOutputFormatter {
    format(event) {
        switch (event.type) {
            case EVENT_TYPE.WINDOW_SEND_START:
                return this._formatWindowSendStart(event);
            case EVENT_TYPE.RWND_PROBE:
                return this._formatRwndProbe(event);
            case EVENT_TYPE.RWND_UPDATE:
                return this._formatRwndUpdate(event);
            case EVENT_TYPE.PACKET_SEND:
                return this._formatPacketSend(event);
            default:
                return super.format(event);
        }
    }

    _formatWindowSendStart(event) {
        return [
            `\n[${event.time}ms] 📦 Window 전송 시작`,
            `          rwnd: ${event.data.rwnd}B (${event.data.rwndPackets} packets)`,
            `          전송 가능: ${event.data.windowSize} packets (Packet#${event.data.startPacketId} ~ #${event.data.endPacketId})`,
        ].join('\n');
    }

    _formatRwndProbe(event) {
        return `[${event.time}ms] 🔍 RWND 자리가 생겼는지 Probe 시작 (seq=${event.data.seq}, rwnd=${event.data.rwnd}B)`;
    }

    _formatRwndUpdate(event) {
        return `[${event.time}ms] 📊 RWND 업데이트: ${event.data.rwnd}B (buffered: ${event.data.buffered}B)`;
    }

    _formatPacketSend(event) {
        return `[${event.time}ms] Send: ${event.data.packet.getPacketInfo()} [rwnd: ${event.data.rwnd}B]`;
    }
}

export default FlowControlOutputFormatter;
