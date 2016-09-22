/**
 * http://usejsdoc.org/
 */
var express = require("express");
var http = require("http");
var mysql = require('mysql');
var body_parser = require('body-parser');
var fs = require('fs');
var base64= require('urlsafe-base64');

var app = express();

var client = mysql.createConnection({
    user: 'root',
    password: '',
    database: 'contentdb',
    port: 3306
});

app.use(express.static(__dirname + "/public"));

app.use(body_parser.json({limit: '50mb'}));
app.use(body_parser.urlencoded({limit: '50mb', extended: true}));

app.get('/contents', function (req, res) {
	client.query('select * from contents order by contentId desc',[], function (error, data) {
        if(error==null)
        {
        	res.send(data);
        	console.log(data);
        }
        else
        	{console.log("error:" + error);}
    });
});

app.post('/contents', function (req, res) {
	
	client.query('INSERT INTO contents (contentOne, contentTwo, contentImg) VALUES(?,?,?)', 
			[req.body.contentOne,req.body.contentTwo,req.body.contentImg], function(error,info){
		if(error==null){
			console.log("one:"+req.body.contentOne+"//two:"+req.body.contentTwo+"//Img:"+req.body.contentImg+"//url:"+req.body.contentImgURL.length);
			var tmpData = req.body.contentImgURL.split(",");
		   	var tmpData2 = tmpData[1];
		   	var buffer = new Buffer(tmpData2,'base64');
		   	console.log(info);
		   	
		   	var newPath= __dirname + "/public/uploadImgs/"+info.insertId+".png";
		   	
		   	fs.writeFile(newPath, buffer,function(err){
		  		if(err==null)
		  			{	console.log("file saved");}
		   	});

		    
		   		console.log("insert success");
		    		
		   		 var contentImgStorage = "uploadImgs/"+info.insertId+".png";
		   		 console.log("테스트:"+info.insertId +","+ contentImgStorage);
		   		 client.query('UPDATE contents SET contentImgStorage=? where contentId=?',
		   				 [contentImgStorage,info.insertId], function(er, data) {
		   					if(er==null)
		   						{console.log("update success"); res.send(data);}
		   					else
		   						{console.log("update fail:" + er);}
		   		 });
	    	}else{
	    		console.log("insert fail error:"+error);
	    	}
	});
});

http.createServer(app).listen(8080, function(){
	console.log("server running on port 8080");
});