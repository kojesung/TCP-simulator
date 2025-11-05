# TCP 시뮬레이터

### TCP 핵심 기능

-   **연결 관리**
    -   3-way handshake (연결 시작)
    -   4-way handshake (연결 종료)
-   **신뢰성 보장**
    -   Sequence/ACK number 관리
    -   Timeout 기반 재전송
    -   MSS 기반 Fragmentation (1460 bytes)
-   **흐름 제어 (Flow Control)**
    -   Receiver window 기반 전송량 조절
    -   버퍼 처리 속도 고려
-   **혼잡 제어 (Congestion Control)**
    -   Slow Start
    -   Congestion Avoidance
    -   Fast Retransmit
    -   Fast Recovery (TCP Reno)

---

### 프로그램 기능

-   Basic/Flow Control/Congestion Control mode 제공
    -   각 모드별 고려하는 알고리즘
    -   Basic
        -   3-way handshake를 활용한 연결
        -   4-way handshake를 활용한 연결 종료
        -   Seq/ACK
        -   Timeout에 기반한 재전송
        -   MSS에 기반한 fragmentation
    -   Flow Control
        -   rwnd에 따른 flow control
        -   버퍼 처리 속도 고려
    -   Congestion Control
        -   Slow start
        -   Congestion Avoidance
        -   TCP Reno
        -   Fast Retransmission
        -   Fast Recovery
-   입력받을 항목들
    -   전송할 데이터 크기
        -   MSS는 1460 bytes로 고정
    -   RTT(ms)
    -   패킷 손실률(%)
    -   [FLOW_CONTROL]
        -   Receiver window size
        -   Receiver의 packet 처리 속도(packets per RTT)
    -   [CONGESTION_CONTROL]
        -   초기 cwnd
    -   1 - INSTANT : 즉시 출력 (결과 확인용)
        2 - SLOW : 실시간 지연 (학습용, 1:1 비율)
        3 - FAST : 빠른 지연 (학습용, 10:1 비율)

---

## 구현 상세

-   **MSS (Maximum Segment Size)**: 1460 bytes 고정
-   **Timeout**: RTT × 2
-   **Initial Sequence Number**: 랜덤 (1000~9999)
-   **ACK 방식**: Cumulative ACK
-   **재전송 방식**: Selective (해당 패킷만)

---
