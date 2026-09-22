# Review 서브에이전트 작업 지시서

## 목적
`apps/pixel-art-editor/` 안에 구현된 픽셀 아트 에디터(`index.html`, `style.css`, `script.js`)를 `spec.md` 기준으로 검증하고, 결과를 `review.md`로 남긴다.

## 범위
- 검토 대상: `apps/pixel-art-editor/index.html`, `apps/pixel-art-editor/style.css`, `apps/pixel-art-editor/script.js`
- 비교 기준: `apps/pixel-art-editor/spec.md`
- 문제를 발견하면 `apps/pixel-art-editor/` 안의 위 3개 파일만 직접 수정해서 고친다. 그 외 블로그 파일(`apps/2048/` 포함)은 건드리지 않는다.
- 산출물 `apps/pixel-art-editor/review.md`를 새로 작성한다.

## 해야 할 일
1. `apps/pixel-art-editor/spec.md`를 읽고 기대 동작(핵심 함수, 이벤트 흐름, PNG 저장 방식)을 파악한다.
2. `index.html`, `style.css`, `script.js` 코드를 정독하며 다음을 점검한다:
   - 문법 오류나 명백한 런타임 버그가 없는지
   - 좌표 변환(`getCellFromEvent`)이 정확한지, 캔버스 리사이즈 후에도 어긋나지 않는지
   - Pointer Events 처리가 마우스/터치 모두에서 정상 동작할 구조인지, `touch-action: none`이 캔버스에만 적용되어 있는지 (body 전체에 걸려 페이지 스크롤을 막지는 않는지)
   - PNG 저장 로직이 spec대로 16배 확대(256x256), 그리드 선 없이, 투명 칸은 실제 알파 0으로 저장되는지
   - 지우개/전체 지우기/색상 선택(팔레트+커스텀) 로직이 올바른지
   - 다크모드(`prefers-color-scheme`)가 적용되는지, 반응형(768px/640px 기준)이 spec대로인지
3. 실제로 브라우저에서 열어서 다음을 직접 조작해 확인한다:
   - 마우스 클릭/드래그로 여러 칸을 연속으로 칠할 수 있는지
   - 팔레트 색상 선택, 커스텀 색상(`<input type="color">`) 선택이 반영되는지
   - 지우개로 칠한 칸을 지우면 체크보드로 돌아오는지
   - "전체 지우기"가 동작하는지
   - "PNG로 저장" 클릭 시 다운로드가 트리거되는지 (가능하면 다운로드된 이미지의 크기(256x256)와 투명 배경 여부를 확인)
   - 모바일 뷰포트(예: 375px)로 리사이즈했을 때 레이아웃이 정상인지(세로 배치로 전환되는지)
4. 문제를 발견하면 `apps/pixel-art-editor/` 안의 파일만 직접 수정해서 고친다. 고치기 애매하거나 범위를 벗어나는 큰 이슈면 고치지 말고 review.md에 이슈로만 남긴다.
5. 점검 결과를 `apps/pixel-art-editor/review.md`에 정리한다: 확인한 항목 목록, 발견한 문제와 조치 여부(수정함/미수정), 브라우저로 확인한 결과.

## 하지 말아야 할 것
- `apps/pixel-art-editor/` 밖의 어떤 파일도 만들거나 수정하지 않는다.
- git 커밋을 하지 않는다 (커밋은 이후 Embed 단계에서 처리한다).
- spec.md에 없는 새 기능을 추가하지 않는다.

## 완료 조건
`apps/pixel-art-editor/review.md` 작성 완료, 발견한 문제는 가능한 선에서 직접 수정 완료. 완료 후 핵심 결과를 요약해서 보고할 것 (문제 있었는지, 고쳤는지, 최종 상태가 정상인지 — 300단어 이내).
