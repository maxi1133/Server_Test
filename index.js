const app = require("express")();

////////////// middle ware

const bodyparser = require("body-parser");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

const cors = require("cors");
app.use(cors({}));


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

////////////// Connect DB

const { fbAdmin } = require("./db/firebase");

//const bucket = fbAdmin.storage().bucket();

// bucket.getFiles((e, files) => {
//   files.forEach(async (val) => {
//     let url = await val.getSignedUrl({ action: "read", expires: "03-09-2500" });
//     console.log(url);
//   });
// });



///////////////////////////////////////////////////////////////// Route

const fs = require("fs");
const multer = require("multer");
const path = require("path");

let imageUploader = multer({ dest: "images/" }); // (**)

app.post("/upload", imageUploader.single("hinh"), (req, res) => {
  try {
    let processedFile = req.file || {}; // MULTER xử lý và gắn đối tượng FILE vào req
    let orgName = processedFile.originalname || ""; // Tên gốc trong máy tính của người upload
    orgName = orgName.trim().replace(/ /g, "-");
    const fullPathInServ = processedFile.path; // Đường dẫn đầy đủ của file vừa đc upload lên server
    // Đổi tên của file vừa upload lên, vì multer đang đặt default ko có đuôi file
    const newFullPath = `${fullPathInServ}-${orgName}`;
    fs.renameSync(fullPathInServ, newFullPath);
    res.send({
      status: true,
      message: "file uploaded",
      fileNameInServer: newFullPath,
    });
  } catch (error) {
    res.send({ status: false, message: "not contain image" });
  }
});

app.get("/images/:name", (req, res) => {
  let fileName = req.params.name;
  if (!fileName) {
    return res.send({
      status: false,
      message: "no filename specified",
    });
  }
  res.sendFile(path.resolve(`./images/${fileName}`));
});

app.get('/',(req,res)=> { res.send({a:'welcome'})})

///////////// Admin Account
let AdminUser , AdminPassword
fbAdmin.database().ref().child('AdminData').on('value',data => 
{
  AdminUser = data.val().User
  AdminPassword = data.val().AdminPassword
  console.log(data.val())
})


///////////////////////////
////////////
//////////////////////////      SERVER


const port = 4000;
var http = require("http");
var server = http.createServer(app);
server.listen(port, () => {
  console.log("Server listen on port : " + port);
});
////////////////////////////////
/////////////////////////////// Socket
const socket = require("socket.io").listen(server);


socket.on("connection", (so) => {



  ////////////////////////////////////////////
  ////////////////////////////////////////////ADMIN
  //////////////////////////////////////////// login
  so.on("Admin_Login", (data) => {
    
    let { taikhoan, matkhau } = data;
    if (taikhoan === AdminUser && matkhau === AdminPassword) {
      so.join("AdminRoom");
      so.emit("AdminLogin_res", {
        stt: true,
        msg: " đăng nhập thành còng",
      });
    } else {
      so.emit("AdminLogin_res", {
        stt: false,
        msg: "Sai rồi nhéeee",
      });
    }
  });


  ///////////////////////////////////////// up brand      BRANDDDDDDD


  so.on('ThemBrand',async data => {

    let array = []
    await fbAdmin.database().ref().child('Brands').push({ Brand : data.thuonghieu})
    
    fbAdmin.database().ref().child('Brands').once('value',data => {
      data.forEach(val => 
      {
        array.push( { id: val.key, brand : val.val() } )
        if(data.numChildren() === array.length) { so.emit('getAllBrand_res',array) }
      })
    })

  })


  ///////////////////get brand


  so.on('getAllBrand',data => {

    let array = []
    fbAdmin.database().ref().child('Brands').once('value',data => {
      data.forEach(val => 
      {
        array.push({ id: val.key, brand: val.val() })
        if(data.numChildren() === array.length) { so.emit('getAllBrand_res',array) }
      })
    })

  })


  /////////////////////// ////////////////// up product


  so.on("upDataProDuctToFirebase", (data) => {
    let {imageAdress, tensanpham, thuonghieu } = data
    // fbAdmin
    //   .database()
    //   .ref()
    //   .child("Product")
    //   .push({ imageAdress: data.imageAdress })
    //   .then((e) => {
    //     so.emit("upDataProDuctToFirebase_res", e);
    //   });

    console.log(data)
  });







































  ////////////////////////////////////////////
  //////////////////////////////////////////// CLIENT
  ////////////////////////////////////////////
  so.on("ClientConnected", (data) => 
  {
    // console.log(so.id);
    so.to("AdminRoom").emit("new_Client_connected", { id: so.id });
  });




});