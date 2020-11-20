var BucketName = '버킷 이름';
var bucketRegion = '지역';
var IdentityPoolId = 'pool';

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  params: { Bucket: BucketName }
});

function listFolders() {
  s3.listObjects({ Delimiter: '/' }, function (err, data) {
    if (err) {
      return alert('버킷 목록을 불러오는데 실패했습니다: ' + err.message);
    } else {
      var folders = data.CommonPrefixes.map(function (commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var folderName = decodeURIComponent(prefix.replace('/', ''));
        return getHtml([
          '<p style="margin-right:40px;"><a href="javascript:;" onclick="viewImage(\'' + folderName + '\')">',
          folderName, '</a></p>',
          '<button style="margin-right:40px;" id="del" onclick="deleteFolder(\'' + folderName + '\')">삭제</button><br><br>'
        ]);
      });
      var message = folders.length ?
        getHtml([
          '<p>경로를 클릭하여 접근 가능합니다.<br>삭제 버튼을 클릭하면 폴더를 지울 수 있습니다.</p>'
        ]) :
        '<p>아무것도 존재하지 않습니다. 새로운 폴더를 생성해주세요.';
      var htmlTemplate = [
        '<h3>', BucketName, '</h3>',
        message,
        '<ul>',
        getHtml(folders),
        '</ul>',
        '<br><br>',
        '<button id="option" onclick="createFolder(prompt(\'폴더 이름을 입력하세요: \'))">',
        '폴더 만들기',
        '</button>'
      ]
      document.getElementById('app').innerHTML = getHtml(htmlTemplate);
    }
  });
}


function createFolder(folderName) {
  folderName = folderName.trim();
  if (!folderName) {
    return alert('폴더 이름에는 공백이 아닌 문자가 하나 이상 포함되어야 합니다.');
  }
  if (folderName.indexOf('/') !== -1 || folderName.indexOf('\'') !== -1 || folderName.indexOf('"') !== -1 || folderName.indexOf('\\') !== -1) {
    return alert('폴더 이름에는 \/, \", \' \\를 포함할 수 없습니다.');
  }
  var folderKey = encodeURIComponent(folderName) + '/';
  s3.headObject({ Key: folderKey }, function (err, data) {
    if (!err) {
      return alert('해당 이름의 폴더는 이미 존재합니다.');
    }
    if (err.code !== 'NotFound') {
      return alert('폴더 생성중 오류가 발생했습니다: ' + err.message);
    }
    s3.putObject({ Key: folderKey }, function (err, data) {
      if (err) {
        return alert('폴더 생성중 오류가 발생했습니다: ' + err.message);
      }
      alert('새로운 폴더를 생성했습니다.');
      viewImage(folderName);
    });
  });
}


function viewImage(folderName) {
  var folderPhotosKey = encodeURIComponent(folderName) + '//';
  s3.listObjects({ Prefix: folderPhotosKey }, function (err, data) {
    if (err) {
      return alert('폴더를 불러오는 중 오류가 발생했습니다: ' + err.message);
    }
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + BucketName + '/';

    var photos = data.Contents.map(function (photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        '<p>',
        '<span style = "word-break:break-all; font-size:18px; font-weight:bold;">',
        photoKey.replace(folderPhotosKey, ''),
        '</span><br>',
        '<a href="javascript:;"><img id="img" onclick="fnImgPop(this.src)" src="' + photoUrl + '"/></a>',
        '<br>',
        '<a href="' + photoUrl + '"download><button id="del">다운로드</button></a> ',
        '<span onclick="deletePhoto(\'' + folderName + "','" + photoKey + '\')">',
        '<button id="del">삭제</button>',
        '</span>',
        '</p><br>',
      ]);
    });
    var message = photos.length ?
      '<p>삭제를 누르면 해당 이미지를 삭제할 수 있습니다.</p><br>' :
      '<p>해당 경로에 아무런 이미지도 없습니다. 새로 업로드해주세요.</p>';
    var htmlTemplate = [
      '<h3>',
      BucketName + '/' + folderName,
      '</h3>',
      message,
      '<div>',
      getHtml(photos),
      '</div><br>',
      '<input type="file" id="photoupload" accept="image/*" hidden/>',
      '<label for="photoupload">이미지 선택</label><br><br><span id="file-chosen">파일을 선택해주세요.</span>',
      '<br><br><button id="addphoto" onclick="addPhoto(\'' + folderName + '\')">',
      '이미지 업로드',
      '</button><br><br><br><br><br>',
      '<button id="option" onclick="listFolders()">',
      '이전 경로',
      '</button>',
    ]
    document.getElementById('app').innerHTML = getHtml(htmlTemplate);
    const actualBtn = document.getElementById('photoupload');
    const fileChosen = document.getElementById('file-chosen');

    actualBtn.addEventListener('change', function () {
      fileChosen.textContent = this.files[0].name
    });
  });
}


function deleteFolder(folderName) {
  if (confirm("해당 폴더를 정말 삭제하시겠습니까?") == true) {    //확인
    var folderKey = encodeURIComponent(folderName) + '/';
    s3.listObjects({ Prefix: folderKey }, function (err, data) {
      if (err) {
        return alert('폴더 삭제 중, 오류가 발생했습니다: ', err.message);
      }
      var objects = data.Contents.map(function (object) {
        return { Key: object.Key };
      });
      s3.deleteObjects({
        Delete: { Objects: objects, Quiet: true }
      }, function (err, data) {
        if (err) {
          return alert('폴더 삭제 중, 오류가 발생했습니다: ', err.message);
        }
        alert('폴더를 삭제했습니다.');
        listFolders();
      });
    });
  } else {   //취소
    return false;
  }
}


function addPhoto(folderName) {
  btn = document.getElementById('addphoto');
  btn.disabled = 'disabled';
  var files = document.getElementById('photoupload').files;

  if (!files.length) {
    btn.disabled = false;
    return alert('먼저 이미지 파일을 선택해주세요.');
  }
  else if (files[0].name.indexOf('\'') !== -1) {
    btn.disabled = false;
    return alert('폴더 이름에는 \' 를 포함할 수 없습니다.');
  }
  else {
    document.getElementById("file-chosen").innerHTML = "업로드중...";
    var file = files[0];
    var fileName = file.name;
    var folderPhotosKey = encodeURIComponent(folderName) + '//';

    var photoKey = folderPhotosKey + fileName;
    s3.upload({
      Key: photoKey,
      Body: file,
      ACL: 'public-read'
    }, function (err, data) {
      if (err) {
        btn.disabled = false;
        return alert('이미지 업로드중 오류가 발생했습니다: ', err.message);
      }
      alert('이미지를 업로드했습니다.');
      btn.disabled = false;
      viewImage(folderName);
    });
  }
}

function deletePhoto(folderName, photoKey) {
  if (confirm("정말 삭제하시겠습니까?") == true) {    //확인
    s3.deleteObject({ Key: photoKey }, function (err, data) {
      if (err) {
        return alert('사진 삭제 오류: ', err.message);
      }
      alert('사진을 삭제했습니다.');
      viewImage(folderName);
    });

  } else {   //취소
    return false;
  }
}

function fnImgPop(url){
  var img=new Image();
  img.src=url;
  height = img.height + 5;
  var OpenWindow=window.open('','_blank', 'width=' + img.width + ', height='+ height + ', menubars=no, scrollbars=auto');
  OpenWindow.document.write('<style>body{margin:0px;}</style><a href="javascript:top.close()"><img src="' + url + '" width=100%></a>');
 }