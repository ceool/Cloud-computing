var BucketName = '버킷이름'; //사용전 버킷 이름 입력
var bucketRegion = '지역'; //사용전 지역 이름 입력
var IdentityPoolId = 'pool'; //사용전 IdentityPoolId 입력

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  params: { Bucket: BucketName }
});

//Provides anonymous log on to AWS services
function AnonLog() {
  // Configure the credentials provider to use your identity pool
  AWS.config.region = bucketRegion; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
  });
  // Make the call to obtain credentials
  AWS.config.credentials.get(function () {
    // Credentials will be available when this function is called.
    var accessKeyId = AWS.config.credentials.accessKeyId;
    var secretAccessKey = AWS.config.credentials.secretAccessKey;
    var sessionToken = AWS.config.credentials.sessionToken;
  });
}

function recognizeCelebrities(photoName, folderName, count) {
  AnonLog();
  var photo = encodeURIComponent(folderName) + '//' + photoName;
  var table = "";
  var rekognition = new AWS.Rekognition();
  var params = {
    Image: {
      S3Object: {
        Bucket: BucketName,
        Name: photo
      }
    }
  };

  rekognition.recognizeCelebrities(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      if (data.CelebrityFaces[0] != null) {
        table = "<table><caption>유명인사_찾기</caption><tr><th>　</th><th>　정확도　</th><th>이름</th><th>　인식 좌표　</th></tr>";
        // show each face and build out estimated age table
        for (var i = 0; i < data.CelebrityFaces.length; i++) {
          table += '<tr><td>' + (i + 1) + '</td><td>' + data.CelebrityFaces[i].Face.Confidence.toFixed(2) + '%</td><td>' +
          data.CelebrityFaces[i].Name + '</td><td>' +
            '　Left:' + data.CelebrityFaces[i].Face.BoundingBox.Left.toFixed(2) +
            ', Top: ' + data.CelebrityFaces[i].Face.BoundingBox.Top.toFixed(2) + '　</td></tr>';
        }
        table += "</table>";
        document.getElementById("recognizeCelebritie" + count).innerHTML = table;
      }
    }
  });
  return table;
}

function DetectFaces(photoName, folderName, count) {
  AnonLog();
  var photo = encodeURIComponent(folderName) + '//' + photoName;
  var table = "";
  var rekognition = new AWS.Rekognition();
  var params = {
    Image: {
      S3Object: {
        Bucket: BucketName,
        Name: photo
      },
    },
    Attributes: [
      'ALL',
    ]
  };
  rekognition.detectFaces(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      if (data.FaceDetails[0] != null) {
        table = "<table><caption>사람얼굴_분석</caption><tr><th>　</th><th>　정확도　</th><th>최소</th><th>　최대　</th><th>　성별　</th><th>　인식 좌표　</th></tr>";
        // show each face and build out estimated age table
        for (var i = 0; i < data.FaceDetails.length; i++) {
          table += '<tr><td>' + (i + 1) + 
          '</td><td>' + data.FaceDetails[i].Confidence.toFixed(1) + 
          '%</td><td>' + data.FaceDetails[i].AgeRange.Low +
            '세</td><td>' + data.FaceDetails[i].AgeRange.High +
            '세</td><td>' + data.FaceDetails[i].Gender.Value +
            '</td><td>　Left:' + data.FaceDetails[i].BoundingBox.Left.toFixed(2) +
            ', Top: ' + data.FaceDetails[i].BoundingBox.Top.toFixed(2) + '　</td></tr>';
        }
        table += "</table>";
        document.getElementById("detectFace" + count).innerHTML = table;
      }
    }
  });
  return table;
}

function detectLabels(photoName, folderName, count) {
  AnonLog();
  var photo = encodeURIComponent(folderName) + '//' + photoName;
  var table = "";
  var rekognition = new AWS.Rekognition();
  var params = {
    Image: {
      S3Object: {
        Bucket: BucketName,
        Name: photo
      },
    },
    MaxLabels: 15,
    MinConfidence: 70
  };

  rekognition.detectLabels(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      if (data.Labels[0] != null) {
        table = "<table><caption>이미지_레이블(70%↑)</caption><tr><td>";
        // show each face and build out estimated age table
        for (var i = 0; i < data.Labels.length; i++) {
          table += data.Labels[i].Name;
          if (i != data.Labels.length - 1) {
            if ((i + 1) % 5 == 0)
              table += "<br>";
            else
              table += ", ";
          }

        }
        table += "</td></tr></table>";
        document.getElementById("detectLabel" + count).innerHTML = table;
      }
    }
  });
  return table;
}

function detectModerationLabels(photoName, folderName, count) {
  AnonLog();
  var photo = encodeURIComponent(folderName) + '//' + photoName;
  var str = "";
  var rekognition = new AWS.Rekognition();
  var params = {
    Image: {
      S3Object: {
        Bucket: BucketName,
        Name: photo
      },
    },
    MinConfidence: 50
  };
  rekognition.detectModerationLabels(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      if (data.ModerationLabels[0] != null) {
        str = '<table style="text-align:left;"><caption>불건전한_이미지</caption>';
        for (var i = 0; i < data.ModerationLabels.length; i++) {
          str += '<tr><td>' + data.ModerationLabels[i].Confidence.toFixed(2) + "%　" +
            data.ModerationLabels[i].Name + '</td></tr>';
          //str += data.HumanLoopActivationOutput.HumanLoopArn + "<br>";
          // str += data.HumanLoopActivationOutput.HumanLoopActivationReasons + "<br>";
          // str += data.HumanLoopActivationOutput.HumanLoopActivationConditionsEvaluationResults + "<br>";
        }
        str += '</table>'
        document.getElementById("detectModerationLabel" + count).innerHTML = str;
      }
    }
  });
  return str;
}

function detectText(photoName, folderName, count) {
  AnonLog();
  var photo = encodeURIComponent(folderName) + '//' + photoName;
  var table = "";
  var word = "[WORD]<br>";
  var rekognition = new AWS.Rekognition();
  var tmp = 0;
  var params = {
    Image: {
      S3Object: {
        Bucket: BucketName,
        Name: photo
      },
    },
    Filters: {
      WordFilter: {
        MinConfidence: 0.8 // 민감도, 정확도와는 다른 개념
      }
    }
  };

  rekognition.detectText(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      if (data.TextDetections[0] != null) {
        table = '<span style="font-size:130%; font-weight:bold; color:cornflowerblue;">텍스트_인식(민감도 0.8, 정확도 80%↑)</span>' + 
        '<table style="text-align:left;"><tr><td style="text-align:center;">[LINE]</td></tr>';
        // show each face and build out estimated age table
        for (var i = 0; i < data.TextDetections.length; i++) {
          if(data.TextDetections[i].Type == 'LINE' && data.TextDetections[i].Confidence >= 80)
          {
            table += '<tr><td>' + data.TextDetections[i].DetectedText + '</td></tr>';
            tmp++;
          }
          else if(data.TextDetections[i].Confidence >= 80)
          {
            word += data.TextDetections[i].DetectedText + ", ";
            tmp++;
          }
        }
        table += '</table>' + word.slice(0, -2);
        if(tmp==0)
          document.getElementById("detectText" + count).innerHTML = "";
        else
          document.getElementById("detectText" + count).innerHTML = table;
      }
    }
  });
  return table;
}

function listFolders() {
  s3.listObjects({ Delimiter: '/' }, function (err, data) {
    if (err) {
      return alert('버킷 목록을 불러오는데 실패했습니다: ' + err.message);
    } else {
      var folders = data.CommonPrefixes.map(function (commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var folderName = decodeURIComponent(prefix.replace('/', ''));
        return getHtml([
          '<span style="margin-right:4.3%;"><a style="font-size: 220%;" href="javascript:;" onclick="viewImage(\'' + folderName + '\')">',
          folderName, '</a></span><br>',
          '<button style="margin-top: 3%; margin-bottom: 3%; margin-right:4.3%;" id="del" onclick="deleteFolder(\'' + folderName + '\')">삭제</button><br><br>'
        ]);
      });
      var message = folders.length ?
        getHtml([
          '<p>목록을 클릭하십시오.<br>삭제 버튼으로 폴더를 지울 수 있습니다.</p>'
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
    return alert('폴더 이름에는 \/, \", \', \\를 포함할 수 없습니다.');
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
  var photoName;
  var count = 0;

  s3.listObjects({ Prefix: folderPhotosKey }, function (err, data) {
    if (err) {
      return alert('폴더를 불러오는 중 오류가 발생했습니다: ' + err.message);
    }
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + BucketName + '/';

    var photos = data.Contents.map(function (photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      photoName = photoKey.replace(folderPhotosKey, '');
      return getHtml([
        '<p>',
        '<span style = "word-break:break-all; font-size:140%; font-weight:bold;">',
        photoName,
        '</span><br>',
        '<a href="javascript:;"><img onclick="fnImgPop(this.src)" src="' + photoUrl + '"/></a>',
        '<a id="link" href="' + photoUrl + '" download="' + photoName + '"><button id="del">다운로드</button></a> ',
        '<span style="margin-bottom:1.5%;" onclick="deletePhoto(\'' + folderName + "','" + photoKey + '\')">',
        '<button id="del">삭제</button>',
        '</span>',
        '<span id="recognizeCelebritie' + count + '">' + recognizeCelebrities(photoName, folderName, count) + '</span>', //유명인사 인식
        '<span id="detectFace' + count + '">' + DetectFaces(photoName, folderName, count) + '</span>', //얼굴 인식
        '<span id="detectLabel' + count + '">' + detectLabels(photoName, folderName, count) + '</span>', //라벨 감지
        '<span id="detectModerationLabel' + count + '">' + detectModerationLabels(photoName, folderName, count) + '</span>', //위험 감지
        '<span id="detectText' + count + '">' + detectText(photoName, folderName, count++) + '</span>', //텍스트 감지
        '</p><br>',
      ]);
    });
    var message = photos.length ?
      '<p>삭제를 누르면 이미지를 삭제할 수 있습니다.</p><br>' :
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
      '</button><br><br><br><br><br><br>',
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
    return alert('이미지 이름에는 \' 를 포함할 수 없습니다.');
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

function fnImgPop(url) {
  var img = new Image();
  img.src = url;
  height = img.height + 5;
  var OpenWindow = window.open('', '_blank', 'width=' + img.width + ', height=' + height + ', menubars=no, scrollbars=auto');
  OpenWindow.document.write('<style>body{margin:0px;}</style><a href="javascript:top.close()"><img src="' + url + '" width=100%></a>');
}