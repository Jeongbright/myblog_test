# Build 서브에이전트 작업 지시서

## 목적
`apps/pixel-art-editor/spec.md`에 정의된 스펙대로 픽셀 아트 에디터 웹앱을 실제로 구현한다.

## 범위 (반드시 지킬 것)
- 수정/생성 가능한 파일: `apps/pixel-art-editor/index.html`, `apps/pixel-art-editor/style.css`, `apps/pixel-art-editor/script.js` 뿐.
- 그 외 블로그의 어떤 파일도 건드리지 않는다 (루트 `index.html`, `css/`, `js/`, `posts/`, `apps/2048/`, 루트 `CLAUDE.md` 등 전부 read-only로 취급).
- 새 폴더나 별도 하위 폴더를 만들지 않는다. `apps/pixel-art-editor/` 바로 아래에 3개 파일만 만든다.

## 해야 할 일
1. `apps/pixel-art-editor/spec.md`를 정독한다.
2. spec.md에 정의된 파일 구조, DOM 구조, state 구조, 함수 목록, 이벤트 흐름, UI/디자인 방향을 그대로 따라 `index.html`, `style.css`, `script.js`를 작성한다.
3. 프레임워크 없이 순수 HTML/CSS/JS로 작성한다. 외부 라이브러리/CDN을 쓰지 않는다.
4. 다음 기능이 실제로 동작해야 한다:
   - 16x16 캔버스에 클릭/드래그(Pointer Events)로 도트 찍기
   - 24색 팔레트 스와치 + 커스텀 색상(`<input type="color">`) 선택
   - 지우개 도구(칸을 투명/체크보드로 되돌림)
   - 전체 지우기 버튼
   - "PNG로 저장" 버튼 — 16배 확대한 256x256 PNG로 다운로드, 그리드 선 없이 순수 픽셀만, 투명 칸은 실제 알파 0
   - 모바일 터치로도 동일하게 그리기 가능(스크롤과 충돌하지 않게 `touch-action: none` 등 spec에 명시된 처리)
5. 구현 중 spec.md와 다르게 판단이 필요한 부분이 생기면, spec의 의도를 최대한 지키는 선에서 합리적으로 결정하고 무엇을 어떻게 바꿨는지 최종 보고에 남긴다.

## 하지 말아야 할 것
- spec.md에 없는 새로운 기능(예: 실행취소, 저장 파일 불러오기, 레이어 등)을 추가하지 않는다.
- 블로그의 다른 파일이나 `apps/2048/`을 수정하지 않는다.
- 커밋하지 않는다 (커밋은 이후 Embed 단계에서 처리한다).

## 완료 조건
`apps/pixel-art-editor/index.html`, `style.css`, `script.js`가 모두 작성되고, 브라우저에서 열었을 때 기본 동작(그리기/색 선택/지우개/전체 지우기/PNG 저장)이 되는 상태. 완료 후 무엇을 만들었는지, spec과 달라진 부분이 있으면 무엇인지 간단히 보고할 것 (300단어 이내).
