# 기여 가이드

TCP Simulator에 기여해주셔서 감사합니다! 🎉

## 시작하기

### 개발 환경 설정

```bash
# 1. Fork & Clone
git clone https://github.com/fork한-username/TCP-simulator.git
cd tcp-simulator

# 2. 의존성 설치
npm install

# 3. 브랜치 생성
git checkout -b feature/your-feature-name
```

### 코드 컨벤션

-   **네이밍**

    -   클래스: PascalCase (`BaseSimulator`)
    -   함수/변수: camelCase (`sendPackets`)
    -   상수: UPPER_SNAKE_CASE (`TCP.MSS`)
    -   Private 메서드: `#` 접두사 (`#planPacketLoss`)

-   **파일 구조**

    -   한 파일에 하나의 클래스
    -   export default 사용

-   **코드 스타일**
    -   들여쓰기: 4 spaces
    -   세미콜론 사용
    -   문자열: 작은따옴표 `'` 사용

### 커밋 메시지

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**

-   `feat`: 새로운 기능
-   `fix`: 버그 수정
-   `docs`: 문서 수정
-   `style`: 코드 포매팅
-   `refactor`: 코드 리팩토링
-   `test`: 테스트 추가
-   `chore`: 빌드 업무 수정

**예시:**

```
feat(CongestionControlSimulator): Fast Recovery 알고리즘 추가

- Fast Recovery 상태 구현
- cwnd를 업데이트하고 계산합니다
- Fast Recovery와 관련된 출력 포맷팅 추가

```

## 개발 프로세스

### 1. 이슈 생성

새로운 기능이나 버그를 발견하면 먼저 이슈를 생성해주세요.

### 2. 브랜치 생성

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. 개발 & 테스트

```bash
# 개발
npm start

# 테스트 (추후 추가 예정)
npm test
```

### 4. 커밋

```bash
git add .
git commit -m "feat: Add amazing feature"
```

### 5. Push & PR

```bash
git push origin feature/your-feature-name
```

GitHub에서 Pull Request를 생성해주세요.

## Pull Request 가이드라인

### PR 전 체크리스트

-   [ ] 코드가 컨벤션을 따르는가?
-   [ ] 테스트를 추가했는가?
-   [ ] 문서를 업데이트했는가?
-   [ ] 커밋 메시지가 명확한가?

### PR 설명

-   변경 사항을 명확히 설명
-   관련 이슈 번호 포함
-   스크린샷 추가 (UI 변경 시)

## 질문이 있으신가요?

-   이슈를 통해 질문해주세요
-   또는 이메일로 연락주세요: js95112345@gmail.com

다시 한번 기여해주셔서 감사합니다! 🙏
