# TCP 시뮬레이터 요구사항

### 프로젝트 세팅

-   [x] README.md 작성
-   [x] 상수 정의 (constants.js)

### 기본 구조

-   [x] Packet 클래스 구현
-   [x] Timeline 기반 패킷 상태를 출력 전에 결정
    -   [x] Timeline에 들어갈 각 Event 클래스 구현
    -   [x] packet loss 결정 클래스 구현(Timeline에서 loss 판정 결과에 따른 분기 처리)
-   [ ] 입력 처리 (InputView, InputParser)
-   [ ] 출력 처리 (OutputView, OutputFormatter)

### BASIC 모드

-   [x] 3-way handshake 연결 구현
-   [x] Sequence/ACK number 관리
-   [x] MSS 기반 fragmentation
-   [x] Packet loss 시뮬레이션
-   [x] Timeout 재전송
-   [x] 4-way handshake 연결 종료 구현
-   [ ] BASIC 모드 통합 테스트

### FLOW_CONTROL 모드

-   [ ] Receiver window 관리
-   [x] RWND가 부족할 때 1byte씩 보내는 Probe
-   [ ] 처리 속도에 따른 rwnd 변화
-   [ ] FLOW_CONTROL 모드 통합 테스트

### CONGESTION_CONTROL 모드

-   [ ] cwnd 관리 (Slow Start)
-   [ ] Congestion Avoidance
-   [ ] Fast Retransmit (3 dup ACKs)
-   [ ] Fast Recovery
-   [ ] ssthresh 계산
-   [ ] CONGESTION_CONTROL 모드 통합 테스트

### 시뮬레이션 속도

-   [ ] INSTANT 모드 (기본)
-   [ ] FAST 모드 (10:1)
-   [ ] SLOW 모드 (1:1)

---

## 📥 입력 명세

### 공통 입력

```
전송할 데이터 크기를 입력해주세요 (bytes).
10000

RTT를 입력해주세요 (ms).
100

패킷 손실 확률을 입력해주세요 (%).
10

시뮬레이션 모드를 선택해주세요.

1. BASIC
2. FLOW_CONTROL
3. CONGESTION_CONTROL
   1

시뮬레이션 속도를 선택해주세요.

1. INSTANT
2. FAST
3. SLOW
   2
```

### FLOW_CONTROL 추가 입력

```
Receiver window size를 입력해주세요 (packets).
10

Receiver 처리 속도를 입력해주세요 (packets per RTT).
5
```

### CONGESTION_CONTROL 추가 입력

```
초기 cwnd를 입력해주세요 (packets).
1
```

---

## 📤 출력 명세

### BASIC 모드 출력 예시

```
=== TCP 시뮬레이터 (FAST 모드) ===

[연결 설정]
[0ms] SYN → (seq=1234)
[50ms] ← SYN-ACK (seq=5678, ack=1235)
[100ms] ACK → (ack=5679)
✅ 연결 완료!

[데이터 전송]
전송 데이터: 10000 bytes (7 packets)

[100ms] Send: Packet#1
[100ms] Send: Packet#2
[100ms] Send: Packet#3
...
[100ms] Send: Packet#7
[200ms] ← ACK for 8760
[200ms] ❌ Packet Loss: #7 감지
[400ms] ⏰ Timeout: Packet#7
[400ms] 🔄 Retransmit: Packet#7
[500ms] ← ACK for 10220 bytes
✅ 전송 완료!

[연결 종료]
[500ms] FIN →
[550ms] ← ACK
[600ms] ← FIN
[650ms] ACK →
✅ 연결 종료!

=== 통계 ===
총 전송 시간: 650ms
전송 데이터: 10000 bytes (7 packets)
재전송: 1460 bytes (1 packet)
효율: 87.3%
```
