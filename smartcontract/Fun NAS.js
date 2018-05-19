"use strict";

var FunNAS = function() {
    LocalContractStorage.defineProperty(this, "adminAddress"); //Store the admin wallet address
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "dataMap"); //Store all the information for every cell
    LocalContractStorage.defineMapProperty(this, "dataMapIterator"); //Store all the information for every cell
};

FunNAS.prototype = {
    init: function() {
        this.adminAddress = Blockchain.transaction.from;
        this.size = 0;
    },
	//Register the cells, that don't have the owner.
    register: function(key) { //register is free
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if (this.dataMap.get(key) != "" && this.dataMap.get(key) != null) {
            throw new Error("Someone has registered this cell already.");
        }
        var obj = new Object();
		obj.cellKey = key;
        obj.cellOwner = from;
        obj.cellStatus = "0"; //0未在售状态，1在售状态
        obj.cellPrice = "0";
        obj.cellColor = "#0000ff";//默认颜色
        obj.cellRemark = "";
        this.dataMap.set(key, JSON.stringify(obj));
        this.dataMapIterator.set(this.size, key);
        this.size += 1;
    },
	//返回一个格子的信息
    get: function(key) {
        return this.dataMap.get(key);
    },
	//返回所有格子的信息
    getAll: function() {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var myArr = [];
        for (var i = 0; i < this.size; i++) {
            var obj = JSON.parse(this.dataMap.get(this.dataMapIterator.get(i)));
			if (obj.cellOwner == from) {
				obj.isOwner = true;
			}else{
				obj.isOwner = false;
			}
            myArr.push(obj);
        }
        return JSON.stringify(myArr);
    },
	//只返回我拥有的格子
    getAllMy: function() {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var myArr = [];
        for (var i = 0; i < this.size; i++) {
            var obj = JSON.parse(this.dataMap.get(this.dataMapIterator.get(i)));
            if (obj.cellOwner == from) {
                myArr.push(obj);
            }
        }
        return JSON.stringify(myArr);
    },
	//格子信息更新，包括状态，价格，颜色，宣言
    update: function(key, cellStatus, cellPrice, cellColor, cellRemark) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var objStr = this.dataMap.get(key);
        if (objStr == "") {
            throw new Error("Operation failed.");
        }
        var obj = JSON.parse(objStr);
        if (obj.cellOwner != from) {
            throw new Error("You are not the owner.");
        }
        obj.cellStatus = cellStatus;
        obj.cellPrice = cellPrice;
        obj.cellColor = cellColor;
        obj.cellRemark = cellRemark;
        this.dataMap.set(key, JSON.stringify(obj));
    },
	//用户买入格子时，成交
    deal: function(key) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var objStr = this.dataMap.get(key);
        if (objStr == "" || objStr == null) {
            throw new Error("Operation failed.");
        }
        var obj = JSON.parse(objStr);
        if (obj.cellStatus != 1) {
            throw new Error("The cell is not in sale status.");
        }
		
		var nasAmount = value/1000000000000000000;
		
        if (new BigNumber(obj.cellPrice) > nasAmount) {
            throw new Error("Your price is too low.");
        }
        //var result = Blockchain.transfer(obj.cellOwner, value * 0.95 * 1000000000000000000);
		var result = Blockchain.transfer(obj.cellOwner, value * 0.95);
        if (!result) {
            throw new Error("Error Happened");
        }
        Event.Trigger("NASLighting Deal Error", {
            Transfer: {
                from: this.adminAddress,
                to: obj.cellOwner,
                value: value * 0.95
            }
        });
        obj.cellStatus = "0";
        obj.cellPrice = nasAmount;
        obj.cellOwner = from;
        this.dataMap.set(key, JSON.stringify(obj));
    },
	//管理员后台提取管理费
    withdraw: function(withdrawAddress, value) {
        var from = Blockchain.transaction.from;
        var amount = new BigNumber(value);
        if (from != this.adminAddress) {
            throw new Error("You are not the admin.");
        }
        var withdrawAddress = withdrawAddress.trim();
        if (withdrawAddress === "") {
            throw new Error("empty withdrawAddress");
        }
        var result = Blockchain.transfer(withdrawAddress, amount * 1000000000000000000);
        if (!result) {
            throw new Error("transfer failed.");
        }
        Event.Trigger("NASLighting Withdraw Error", {
            Transfer: {
                from: this.adminAddress,
                to: withdrawAddress,
                value: Blockchain.transaction.value
            }
        });
    }
};

module.exports = FunNAS;