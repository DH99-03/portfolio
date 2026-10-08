# 권동현 포트폴리오 사이트

별도 빌드 과정이 없는 정적 HTML 사이트입니다. `index.html`이 GitHub Pages의 첫 화면입니다.

## 로컬에서 보기

`index.html`을 브라우저에서 열거나, 이 폴더에서 `python -m http.server 8000`을 실행한 뒤 `http://localhost:8000/`에 접속하세요.

## 내용 수정

- 소개, 프로젝트, 수상, 자격 정보: `data.js`
- 디자인: `style.css`
- 화면 동작: `script.js`
- 프로필과 프로젝트 이미지: `assets/`
- 메인 HTML을 수정할 때는 `index.html`과 `포트폴리오.html`을 함께 수정하세요. 다른 페이지의 기존 링크가 `포트폴리오.html`을 사용합니다.

## GitHub Pages 게시

이 폴더의 게시용 파일을 `DH99-03/portfolio` 저장소의 기본 브랜치에 올린 뒤, 저장소의 **Settings > Pages**에서 **Deploy from a branch**, **main**, **/(root)**를 선택하고 저장하세요. 사이트 주소는 `https://dh99-03.github.io/portfolio/`입니다.

`_backup_원본/`은 이전 버전 보관용이며 `.gitignore`로 게시 대상에서 제외합니다. `.nojekyll`은 GitHub Pages가 정적 파일을 그대로 제공하도록 합니다.