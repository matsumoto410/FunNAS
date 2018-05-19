$(function() {
    var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
    var nebpay = new NebPay();

    var dappAddress = "n1oMht5MziMbkn2Q2TQqxntSDzTPS5LBp12";
    var txHash = "2594b7d9a7223a69f1853351bd5b3527339bdbad3d672f1b2cc124cf295fe426";
	
    $("#withdrawbutton").click(function() {
        var nasAddress = $("#nasAddress").val();
        var nasAmount = $("#nasAmount").val();

        if (nasAddress == "") {
            alert("请输入NAS收款地址。");
            return;
        }
        if (nasAmount == "") {
            alert("请输入NAS数量。");
            return;
        }
		
		
        var to = dappAddress;
        var value = "0";
        var callFunction = "withdraw";
        var callArgs = "[\"" + nasAddress + "\",\"" + nasAmount + "\"]";
        nebpay.call(to, value, callFunction, callArgs, {
            listener: function(resp) {
                console.log(JSON.stringify(resp));
				alert("请到钱包查询提款是否到账");
            }
        });
    });


});
