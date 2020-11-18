var albumBucketName = '버킷 이름';
var bucketRegion = '지역';
var IdentityPoolId = '개인 코드';

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  params: {Bucket: albumBucketName}
});

function listAlbums() {
  s3.listObjects({Delimiter: '/'}, function(err, data) {
    if (err) {
      return alert('버킷 목록을 불러오는데 실패했습니다: ' + err.message);
    } else {
      var albums = data.CommonPrefixes.map(function(commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace('/', ''));
        return getHtml([
	'<p style="margin-right:50px;"><a href="#" onclick="viewAlbum(\'' + albumName + '\')">', 
	albumName, '</a></p>',
	'<button style="margin-right:50px;" id="del" onclick="deleteAlbum(\'' + albumName + '\')">삭제</button><br><br>'
        ]);
      });
      var message = albums.length ?
        getHtml([
          '<p>경로를 클릭하여 접근 가능합니다.<br>삭제 버튼을 클릭하면 폴더를 지울 수 있습니다.</p>'
        ]) :
        '<p>아무것도 존재하지 않습니다. 새로운 폴더를 생성해주세요.';
      var htmlTemplate = [
        '<h3>joonhyun-bucket</h3>',
        message,
        '<ul>',
          getHtml(albums),
        '</ul>',
        '<button id="option" onclick="createAlbum(prompt(\'폴더 이름을 입력하세요.:\'))">',
          '폴더 만들기',
        '</button>'
      ]
      document.getElementById('app').innerHTML = getHtml(htmlTemplate);
    }
  });
}


function createAlbum(albumName) {
  albumName = albumName.trim();
  if (!albumName) {
    return alert('Album names must contain at least one non-space character.');
  }
  if (albumName.indexOf('/') !== -1) {
    return alert('Album names cannot contain slashes.');
  }
  var albumKey = encodeURIComponent(albumName) + '/';
  s3.headObject({Key: albumKey}, function(err, data) {
    if (!err) {
      return alert('Album already exists.');
    }
    if (err.code !== 'NotFound') {
      return alert('There was an error creating your album: ' + err.message);
    }
    s3.putObject({Key: albumKey}, function(err, data) {
      if (err) {
        return alert('There was an error creating your album: ' + err.message);
      }
      alert('새로운 폴더를 생성했습니다.');
      viewAlbum(albumName);
    });
  });
}


function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + '//';
  s3.listObjects({Prefix: albumPhotosKey}, function(err, data) {
    if (err) {
      return alert('There was an error viewing your album: ' + err.message);
    }
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + '/';

    var photos = data.Contents.map(function(photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        '<p>',
          '<div>',
            '<img style="width:150px;height:150px;" src="' + photoUrl + '"/>',
          '</div>',
          '<div>',
            '<span onclick="deletePhoto(\'' + albumName + "','" + photoKey + '\')">',
              '<button id="del">삭제</button>',
            '</span>',
            '<span>',
              photoKey.replace(albumPhotosKey, ''),
            '</span>',
          '</div>',
        '</p>',
      ]);
    });
    var message = photos.length ?
      '<p>삭제를 누르면 해당 이미지를 삭제할 수 있습니다.</p>' :
      '<p>해당 경로에 아무런 이미지도 없습니다. 새로 업로드해주세요.</p>';
    var htmlTemplate = [
      '<h3>',
        'joonhyun-bucket/' + albumName,
      '</h3>',
      message,
      '<div>',
        getHtml(photos),
      '</div><br>',
      '<input type="file" id="photoupload" accept="image/*" hidden/><label for="photoupload">이미지 선택</label><span id="file-chosen">파일을 선택해주세요.</span>',
      '<br><br><button id="addphoto" onclick="addPhoto(\'' + albumName +'\')">',
        '이미지 업로드',
      '</button><br><br><br><br><br><br><br><br><br>',
      '<button id="option" onclick="listAlbums()">',
        '이전 경로',
      '</button>',
    ]
    document.getElementById('app').innerHTML = getHtml(htmlTemplate);
    const actualBtn = document.getElementById('photoupload');
    const fileChosen = document.getElementById('file-chosen');

    actualBtn.addEventListener('change', function(){
      fileChosen.textContent = this.files[0].name
    });
  });
}

function addPhoto(albumName) {
  var files = document.getElementById('photoupload').files;
  if (!files.length) {
    return alert('먼저 이미지 파일을 선택해주세요.');
  }
  var file = files[0];
  var fileName = file.name;
  var albumPhotosKey = encodeURIComponent(albumName) + '//';

  var photoKey = albumPhotosKey + fileName;
  s3.upload({
    Key: photoKey,
    Body: file,
    ACL: 'public-read'
  }, function(err, data) {
    if (err) {
      return alert('이미지 업로드중 오류가 발생했습니다: ', err.message);
    }
    alert('이미지를 업로드했습니다.');
    viewAlbum(albumName);
  });
}

function deletePhoto(albumName, photoKey) {
 if (confirm("정말 삭제하시겠습니까??") == true){    //확인
  s3.deleteObject({Key: photoKey}, function(err, data) {
    if (err) {
      return alert('사진 삭제 오류: ', err.message);
    }
    alert('사진을 삭제했습니다.');
    viewAlbum(albumName);
  });

 }else{   //취소
     return false;
 }
}

function deleteAlbum(albumName) {
 if (confirm("해당 폴더를 정말 삭제하시겠습니까??") == true){    //확인
  var albumKey = encodeURIComponent(albumName) + '/';
  s3.listObjects({Prefix: albumKey}, function(err, data) {
    if (err) {
      return alert('폴더 삭제 중, 오류가 발생했습니다: ', err.message);
    }
    var objects = data.Contents.map(function(object) {
      return {Key: object.Key};
    });
    s3.deleteObjects({
      Delete: {Objects: objects, Quiet: true}
    }, function(err, data) {
      if (err) {
        return alert('폴더 삭제 중, 오류가 발생했습니다: ', err.message);
      }
      alert('폴더를 삭제했습니다.');
      listAlbums();
    });
  });
 }else{   //취소
     return false;
 }
}


