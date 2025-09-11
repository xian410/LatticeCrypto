/**
 * ajax请求数据
 * apiUrl:为接口
 * data:请求参数
 * type:请求类型
 * callback:回调函数
 * */
function getPostData(apiUrl,data,type,callback) {
        $.ajax({
            type: type,
            url: apiUrl,
            //data: JSON.stringify(data),
            data: data,
            headers:{'Content-Type':"application/x-www-form-urlencoded"},
            success: callback,
            error: function (e) {
                alert(e.msg);
            }
        });
}

