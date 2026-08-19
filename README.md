# CalcReact

React + TypeScript + Vite로 만든 계산기 웹앱입니다.

## 기능

- 사칙연산, 소수점, 부호 전환, 퍼센트
- 연속 계산과 0으로 나누기 오류 처리
- 키보드 입력 지원
- 반응형 UI
- GitHub Actions를 통한 GitHub Pages 빌드/배포

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## GitHub Pages

`main` 브랜치에 푸시하면 `.github/workflows/deploy-pages.yml`이 `dist`를 빌드하고 GitHub Pages로 배포합니다.
저장소의 **Settings → Pages → Build and deployment → Source**가 **GitHub Actions**로 설정되어 있어야 합니다.
