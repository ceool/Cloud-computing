# Cloud-computing-Project
## A. 프로젝트 명
### **AWS S3 버킷 클라우드 이미지 관리 및 Rekognition을 이용한 이미지 분석 웹페이지**
  - 브라우저에서 AWS 우분투 nginx 웹서버에 접속하여 AWS S3 버킷의 폴더와 이미지 관리(업로드, 다운로드, 삭제)
  - Amazon Rekognition을 이용한 이미지 인식 결과를 웹으로 볼 수 있음.
    + KOR: **유명인사 찾기, 사람얼굴 분석, 이미지 레이블, 텍스트 인식(LINE, WORD), 불건전한 이미지 인식**
    + ENG: recognizeCelebrities, DetectFaces, detectLabels, detectText, detectModerationLabels


## B. 프로젝트 멤버 이름 및 멤버 별로 담당한 파트에 대한 소개
### **박준현(20165315)**: 
  - 한림대학교 3학년 빅데이터 전공 재학 중.
  - Everything. (서버 구축, html CSS Javascript 코딩, 기획 및 완성)
  
이외 멤버 없음.


## C. 프로젝트 소개 및 개발 내용 소개
 - 해당 프로젝트는 아마존의 AWS 클라우드 서비스를 기반으로 만들어졌습니다.
 - 자바스크립트와 HTML은 서버 파일을 직접 불러올 수 없지만, S3 버킷을 사용하여 파일을 불러오도록 구현할 수 있습니다.
 - 아마존 AWS의 S3 Bucket과 AWS Rekognition을 Cognito 자격증명 폴로 접근하여 웹에서 사용할 수 있도록 개발했습니다.
 - 웹브라우저로 S3의 Bucket으로 간편하게 파일을 업로드할 수 있으며, 버킷에 있는 파일을 다운로드, 삭제할 수 있습니다.
    + S3 버킷의 폴더도 간편하게 생성 및 삭제가 가능합니다.
 - S3의 이미지 파일들은 AWS Rekognition 결과를 웹페이지에서 바로 볼 수 있습니다.
 - 버킷 폴더 안의 이미지를 웹에서 볼 때, AWS Rekognition 과정을 기다릴 필요가 없으며 결과가 나오는대로 웹에 보여집니다.
    + 즉, Rekognition 결과가 나올 때까지 기다리지 않아도, 이미지 업로드, 삭제, 다운로드 폴더 생성 등 모든 작업을 할 수 있습니다.


## D. 프로젝트 개발 결과물 소개 (+ 다이어그램)
![diagram](https://user-images.githubusercontent.com/62891711/101473403-22af0700-398d-11eb-8873-83f5748fa1a5.png)
* Amazon Cognito 자격증명 폴 관리를 생성하고 S3 버킷과 Rekognition 접근이 가능하도록 했습니다.
  - AWS ICM에서 AmazonRekognitionReadOnlyAccess, AmazonS3FullAccess에 생성한 Cognito의 정책을 사용하도록 허용.
  - ***에듀케이션 계정의 토큰(AWS CLI)이 시간마다 변하여도 아무 상관없이 언제 어디서나 접속할 수 있습니다.***
* 생성했던 S3 버킷에서도 CORS(Cross-origin 리소스 공유) 정보를 AWS CLI를 이용하여 JSON 코드를 추가함으로 써 "GET" "HEAD" "POST" "PUT" "DELETE"를 할 수 있도록 하였습니다.
* S3 버킷 스토리지는 AWS EC2에서 우분투 인스턴스를 이용한 NGINX 웹페이지 서버를 통하여 외부에서 웹으로 제어합니다.
* 제작 언어는 자바스크립트, CSS 와 HTML 로 구성하여 만든 웹페이지 서버입니다.
* 웹페이지에서 버킷에 폴더 생성과 삭제 및 이미지 다운로드, 삭제, 업로드가 가능합니다.
* 웹에서 보고 있는 해당 경로의 이미지들은 Rekognition으로 인식 결과를 자동으로 순차적으로 띄어줍니다.


## E.	개발 결과물을 사용하는 방법 소개
### 1. 초기화면
<img src="https://user-images.githubusercontent.com/62891711/101464122-99460780-3981-11eb-838a-dbac1d70925a.png"  width="500">
<p>[이미 생성되어 있는 폴더와 삭제 버튼, 그리고 폴더 만들기 버튼이 보이는 모습]</p>

 - 경로 이름을 클릭하면 해당 경로로 이동할 수 있습니다. (바로 아래 오른쪽 사진 확인) 
 - 많은 폴더를 생성하여도 맨 아래로 스크롤을 하면 '폴더 만들기'와 겹칠 수 없도록 만들었습니다.
 - 생성된 폴더가 없으면 풀더가 없다고 표시됩니다.
 - 폴더를 삭제하게 될 경우, 삭제 버튼을 누르면 삭제 여부를 선택 후 삭제할 수 있습니다.
 
---
 
### 2. 폴더생성 및 이전경로
<img src="https://user-images.githubusercontent.com/62891711/101477481-9d2e5580-3992-11eb-85d3-73668f338759.png"  width="700">

  - 폴더 만들기 버튼과 이전 경로 버튼은 항상 하단에 고정되어있습니다.
  - 자바스크립트에 영향을 주는 단어는 폴더 이름으로 사용할 수 없게 막아두었습니다. 
  - 이전 경로를 누르면 초기화면으로 돌아갑니다. 
  - 많은 이미지가 있어도 맨 아래로 스크롤 하면 '이전 경로'와 겹치지 않도록 만들었습니다.
  
---

### 3. 이미지 선택 및 업로드
<img src="https://user-images.githubusercontent.com/62891711/101467095-3b1b2380-3985-11eb-89c2-8472daa9ba10.png"  width="700">

  - 이미지를 선택하지 않으면 업로드 할 수 없으며, accept="image/*" 처리를 해두었습니다. 
  - 이미지가 업로드 되고 있는 중에는 버튼이 클릭되지 않도록 막아두었습니다. (중복 업로드 방지) 
  - 이미지 이름에는 자바스크립트에 영향을 주는 '를 사용할 수 없습니다.
  - 이미지 외에 파일을 올릴 수 있는 것은 굳이 막지 않았습니다. (클라우드로써 모든 파일을 저장할 수 있도록)

---

### 4. 버킷에 있는 이미지
<img src="https://user-images.githubusercontent.com/62891711/101470395-4b350200-3989-11eb-9840-45d693cdc35a.png"  width="779">

  - 이미지를 클릭하면, 이미지를 확대해서 볼 수 있습니다. (새로운 창에서 열리며, 확대된 사진 클릭 시 열린 창이 닫아짐.)
  - 다운로드 버튼을 누르면 이미지 다운로드가 가능합니다.
  - 삭제 버튼을 누르면 삭제 여부를 물어보고, 삭제 여부를 선택 후 삭제할 수 있습니다.
  - 먼저 S3버킷에 있는 이미지가 불러와진 후, AmazonRekognition 정보가 불러와지면 그 즉시 바로 웹에 이미지 정보를 보여줍니다. 
  - 사전에 소개해드린 5가지 기능 중에서 인식되는 정보가 없으면 웹에서 보이지 않습니다.

---

### 5. AmazonRekognition 분석결과
![rekg](https://user-images.githubusercontent.com/62891711/101475495-d74a2800-398f-11eb-9b04-073c7edec37a.png)
  - 텍스트가 인식되면 LINE은 한 줄씩, WORD는 한 단어씩','로 구분하여 출력합니다.
  - 인식 좌표는 얼굴의 왼쪽과 윗 부분의 좌표입니다.
  - 레이블은 70% 정확도를 가진 정보들만 보여주며, 한 라인에 5개씩 보여줍니다.
  - 불건전한 이미지는 정확도와 함께 나타납니다.
  - 5가지 기능 중에서 인식되는 정보가 없으면 웹페이지에 표시되지 않습니다.
  
## F. 개발 결과물의 필요성 및 활용방안
  - 이미지에 대한 정보를 텍스트로 얻고자할 때 간편하게 얻을 수 있으며, 불건전한 이미지인지도 색출해줍니다.
  - 텍스트로 된 이미지나 스캔한 책의 이미지를 간편하게 텍스트를 추출할 수 있습니다.
  - 사진 속 인물이 남자인지 여자인지, 유명한 인물인지 업로드만으로 손쉽게 알 수 있습니다.
  - GUI로 아마존 S3 버킷에 있는 파일들을 손쉽게 관리가 가능하며 업로드와 다운로드, 삭제가 간편합니다.
  - AmazonRekognition 기능을 직관적으로 스마트폰이나 PC로 웹에 접속하여 손쉽게 사용할 수 있습니다.
  - HTML에서 보안상의 이유로 파일 접근이 불가능하지만, S3 버킷을 이용하여 서버의 이미지를 바로 Rekognition 결과를 보는 것처럼 할 수 있습니다.
  
