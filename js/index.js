var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var cols = 16;
var  rows = 16;
var myArr = [];
var objId = "";
var dappAddress = "n1oMht5MziMbkn2Q2TQqxntSDzTPS5LBp12";
$(function() {
	
	draw("NAS");
	loadCells();
	
	$("#buybutton").click(function(){
		if(objId == ""){
			alert("请选择要买入的格子");
			return;
		}
		var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
		var nebpay = new NebPay();


			var to = dappAddress;
			var value = "0";
			var callFunction = "register";
			if($("#cellOwner").val() != ""){
				value = parseFloat($("#cellPrice").val());
				callFunction = "deal";
			}
			var callArgs = "[\"" + objId + "\"]";
			nebpay.call(to, value, callFunction, callArgs, {
				listener: function(resp) {
					console.log(JSON.stringify(resp.result));
					alert("买入成功，请刷新页面");
				}
			});
		});
		
		$("#savebutton").click(function(){
		if(objId == ""){
			alert("请选择要更新的格子");
			return;
		}
		var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
		var nebpay = new NebPay();


			var to = dappAddress;
			var cellKey = objId;
			var cellOwner = $("#cellOwner").val();
			var cellStatus = $("#cellStatus").val();
			var cellPrice = $("#cellPrice").val();
			if(isNaN(cellPrice)){
				alert("价格输入错误。");
				return;
			}
			
			var cellColor = $("#cellColor").spectrum("get").toHexString();
			var cellRemark = $("#cellRemark").val().replace(/\n/g,"<br>");
			
			var value = "0";
			var callFunction = "update";
			
			
			var callArgs = '["' + cellKey + '","' + cellStatus + '","' + cellPrice + '","' + cellColor + '","' + cellRemark + '"]';
			nebpay.call(to, value, callFunction, callArgs, {
				listener: function(resp) {
					console.log(JSON.stringify(resp.result));
					alert("更新成功，请刷新页面");
				}
			});
		});
		

});

function displayCell(obj){
	objId = obj.id;
	$(obj).removeClass("blackDiv");
	$(".roundDiv").css("border-width","1px");
	$(".roundDiv").addClass("blackDiv").removeClass("roundDiv");
	$(obj).addClass("roundDiv");
	$(obj).css("border-width","2px");
	$(".redDiv").css("border-width","2px");
	
	var isRegistered = false;
	var obj;
	for(var i=0;i<myArr.length;i++){
		if(myArr[i].cellKey == objId){
			isRegistered = true;
			obj = myArr[i];			
			break;
		}
	}
	if(isRegistered){
		$("#cellOwner").val(obj.cellOwner);
		$("#cellStatus").val(obj.cellStatus);
		$("#cellPrice").val(obj.cellPrice);
		
		$("#cellRemark").val(obj.cellRemark.replace(/<br>/g,"\n") );
		
		if(obj.isOwner == false){
			$("#cellStatus").attr('disabled', true);
			$("#cellPrice").attr('readonly', true);
			//$("#cellColor").attr('readonly', true);
			$("#cellColor").spectrum({    color: obj.cellColor, disabled: true});
			$("#cellRemark").attr('readonly', true);
			$("#savebutton").attr("disabled", true);
			
			if(obj.cellStatus == 1){
				$("#buybutton").attr("disabled", false);
			}else{
				$("#buybutton").attr("disabled", true);
			}
		}else{
			$("#cellStatus").attr('disabled', false);
			$("#cellPrice").attr('readonly', false);
			//$("#cellColor").attr('readonly', false);
			$("#cellColor").spectrum({    color: obj.cellColor});
			$("#cellColor").spectrum("enable");
			$("#cellRemark").attr('readonly', false);
			$("#savebutton").attr("disabled", false);
			$("#buybutton").attr("disabled", true);
		}
		
	}else{
		$("#cellOwner").val("");
		$("#cellStatus").val("1");
		$("#cellPrice").val("0");
		
		$("#cellRemark").val("");
		
		
			$("#cellStatus").attr('disabled', true);
			$("#cellPrice").attr('readonly', true);
			//$("#cellColor").attr('readonly', true);
			$("#cellColor").spectrum({    color: "#FFF", disabled: true});
			$("#cellRemark").attr('readonly', true);
			$("#savebutton").attr("disabled", true);
			$("#buybutton").attr("disabled", false);
	}
	
	
	
	
}


function loadCells(){
    var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
    var nebpay = new NebPay();


        var to = dappAddress;
        var value = "0";
        var callFunction = "getAll";
        var callArgs = "[]";
        nebpay.simulateCall(to, value, callFunction, callArgs, {
            listener: function(resp) {
                //console.log(JSON.stringify(resp.result));
				if(resp.result == "" || resp.result == null){
					return;
				}
                myArr = JSON.parse(JSON.parse(resp.result));
				
				for(var i =0;i<myArr.length;i++){
					var divId = myArr[i].cellKey;
					$("#"+divId).css("background-color", myArr[i].cellColor);
if(myArr[i].isOwner){
$("#"+divId).addClass("redDiv");
}
				}
 
            }
        });
		
		
}

function draw(txt){
cols = txt.length * 16
canvas.width = cols;
canvas.height = rows;
ctx.clearRect(0,0,cols,rows);
ctx.font = "16px SimSun";
ctx.fillStyle = "#000";
    ctx.fillText(txt, 0, 14);
var data = ctx.getImageData(0, 0, cols, rows)
var len = data.data.length;
var res = '';
for(var i = 1; i <= rows; i++){
for(var j = 1; j <= cols; j++){
var pos = (( i-1 )*cols+( j ))*4 -1;
if(data.data[pos] > 0){
res += '<div class="blackDiv" style="left:' + (j*21-80) + 'px;top:' + (i*21-80) + 'px" id="' + i + '_' + j + '" onclick="displayCell(this);"></div>';
}
}
}
wrap.innerHTML = res;
}