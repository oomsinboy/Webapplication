var express = require("express");
var app = express();
app.set("view engine", "ejs");
const path = require('path')
const firebase = require("firebase"); // Required for side-effects 
require("firebase/firestore");
const multer = require('multer')
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const admin = require('firebase-admin');

const firebaseConfig = require('../Web/project-d92a4-firebase-adminsdk-7wr04-8913dfdb15.json');
const { query } = require("express");
const uuid = require('uuid-v4');
const { getMaxListeners } = require("process");
const { fail } = require("assert");
admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    storageBucket: 'gs://project-d92a4.appspot.com/Med_pill'
})
// Initialize Firebase
// const firebaseTest = initializeApp(firebaseConfig);
// const analytics = getAnalytics(firebaseTest);

const db = admin.firestore();
const bucket = admin.storage().bucket();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/public/style')));
const multerOftion = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
        console.log(file)
    }
})
const upload = multer({
    storage: multerOftion
})

app.get("/", function (req, res) {
    res.render("page");
})

app.get("/pill", function (req, res) {
    const pillx = []
    db.collection('medpill').get().then((querySnap) => {
        querySnap.forEach((doc) => {
            pillx.push(doc.data())

        })
        res.render("pilldata", { result: pillx });
    })
}
)

app.get("/home", function (req, res) {
    const user = []
    db.collection('users').get().then((querySnap) => {
        querySnap.forEach((doc) => {
            user.push(doc.data())

        })
        console.log(user[0].Name);
        res.render("home", { result: user });
    })
}
)
///////////////////////////////ความดันโลหิต////////////////////////////////////

app.get("/pressure", function (req, res) {
    const user = []
    db.collection('users').get().then((querySnap) => {
        querySnap.forEach((doc) => {
            user.push(doc.data())

        })
        console.log(user[0].Name);
        res.render("add_pressure", { result: user });
    })

    
}
)

app.get("/add_pressure_users/:email", function (req, res) {
    const user = []
    const id = req.params.email
    const useid = []
    db.collection('edit_pressure').doc(id).collection('all').get().then((querySnap) => {
        querySnap.forEach((doc) => {
            user.push(doc.data())
            useid.push(doc.id)
            
        })
        for(let i = 0 ; i < user.length ; i++){
            
            var d = new Date(user[i].Adata_time.seconds*1000);
            dformat = [d.getMonth()+1,
                d.getDate(),
                d.getFullYear()].join('/')+' '+
               [d.getHours(),
                d.getMinutes(),
                d.getSeconds()].join(':');
               user[i].Adata_time = dformat
            // console.log(dformat)
        }
        // console.log(dformat)
        // console.log(new Date(user[0].Adata_time.seconds*1000));
        console.log(user)       

        res.render("add_pressure_users", { result: user, email: id,useid: useid });

        
    })
}
)

//////////////////////////////////แอดยา///////////////////////////////////////

app.get("/addpill", function (req, res) {
    const user = []
    db.collection('users').get().then((querySnap) => {
        querySnap.forEach((doc) => {
            user.push(doc.data())

        })
        console.log(user[0]);
        res.render("add_pill", { result: user });
    })
}
)

app.get("/add_pill_uers/:email", function (req, res) {
    const user = []
    const id = req.params.email
    const useid = []
    db.collection('drugs').doc(id).collection('drug').get().then((querySnap) => {
        querySnap.forEach((doc) => {
            user.push(doc.data())
            useid.push(doc.id)

        })
        console.log(user[0]);
        res.render("add_pill_users", { result: user, email: id,useid: useid });
    })
}
)
////////////////////////////////////////////////////////////////////////////


app.post("/login", function (req, res) {
    const { loginmail, loginpass } = req.body
    const user = []
    db.collection('users').where('email', '==', loginmail, 'password', '==', loginpass).get().then((querySnap) => {
        querySnap.forEach((doc) => {
            console.log(doc.data())
            user.push(doc.data())

        })
        
        if(user.length == 1) {
            console.log(user.length);
            res.send(user);
        } else {
            res.send("no data")
        }
        

    })
})

app.post("/logout", function (req, res){
    res.render('page')
})


app.post('/delete1/:id', function (req, res) {
    const id = req.params.id
    db.collection('users').doc(id).delete()
    res.send('/home')
    

})

app.post('/delete2/:id', function (req, res) {
    const id = req.params.id
    db.collection('medpill').doc(id).delete()
    res.send('/pill')
    

})

app.put('/edit/:id', function (req, res) {
    const { saveupname, saveupemail, saveuphn, saveuppassword } = req.body
    const id = req.params.id
    db.collection('users').doc(id).update({ 'Name': saveupname, 'email': saveupemail, 'numberHN': saveuphn, 'password': saveuppassword })
    res.send('/home')



})
////////////////////////////////แอดยา/////////////////////////////////////
app.post('/deletedruguser', function (req, res) {
    const { id, email } = req.body
    console.log(req.body)
    db.collection('drugs/'+email+'/drug').doc(id).delete()
    res.send('success')
    
})

app.put('/editdruguser', function (req, res) {
    const { savedrug, savedrugnumber, savedrugdate, savedrugtime, savedrugnote, email,id } = req.body
    db.collection('drugs/'+email+'/drug').doc(id).update({
        'drug_name': savedrug, 'drug_quantity': savedrugnumber, 'drug_date': savedrugdate, 'drug_time_start': savedrugtime, 'drug_note': savedrugnote,
    })
    res.send('success')

})

app.post('/adddrug', function (req, res) {
    const { savedrug, savedrugnumber, savedrugdate, savedrugtime, savedrugnote, email } = req.body
    console.log(req.body)
    //while (check) {
    let number = 10000000
    const give = []
    db.collection('drugs').doc(email).collection('drug').get().then((querySnap) => {
        if (querySnap._size === 0) {
            console.log('test')
            db.collection('drugs').doc(email).collection('drug').add({ 'drug_name': savedrug, 'drug_quantity': savedrugnumber, 'drug_date': savedrugdate, 'drug_time_start': savedrugtime, 'drug_note': savedrugnote, 'drug_notification_id': number })
            res.send('/addpill')
        }
        else {
            querySnap.forEach((doc) => {
                give.push(doc.data().drug_notification_id)
                //console.log(doc.data())

            })
            number = (Math.max(...give) + 1)
            console.log(number);
            db.collection('drugs').doc(email).collection('drug').add({ 'drug_name': savedrug, 'drug_quantity': savedrugnumber, 'drug_date': savedrugdate, 'drug_time_start': savedrugtime, 'drug_note': savedrugnote, 'drug_notification_id': number })
            res.send('/addpill')

        }


    })
    // }


})

/////////////////////////////// ความดันโลหิต ////////////////////////////////////

app.post('/deletepressureuser', function (req, res) {
    const { id, email } = req.body
    console.log(req.body)
    db.collection('edit_pressure/'+email+'/all').doc(id).delete()
    res.send('success')
    
})

app.put('/editpressureuser', function (req, res) {
    const {  savepressureon, savepressurelower, savepressurerate, email,id } = req.body
    db.collection('edit_pressure/'+email+'/all').doc(id).update({
        'Adata_time': new Date(), 'data_title': savepressureon, 'data_description': savepressurelower, 'data_heartrate': savepressurerate,
    })
    res.send('success')

})

app.post('/addpressure', function (req, res) {
    const { savepressureon, savepressurelower, savepressurerate, email } = req.body
    console.log(req.body)
    //while (check) {

    const give = []
    // db.collection('edit_pressure').doc(email).collection('all').get().then((querySnap) => {
    //     if (querySnap._size === 0) {
    //         console.log('test')
    //         db.collection('edit_pressure').doc(email).collection('all').add({ 'Adata_time': savepressuredate, 'data_title': savepressureon, 'data_description': savepressurelower, 'data_heartrate': savepressurerate})
    //         res.send('/pressure')
    //     }

    // })
    // }

    db.collection('edit_pressure').doc(email).collection('all').add({ 'Adata_time': new Date(), 'data_title': savepressureon, 'data_description': savepressurelower, 'data_heartrate': savepressurerate})
        res.send('/pressure')
    


})

//////////////////////////////////////////////////////////////////


app.post('/add', function (req, res) {
    const { saveupname, saveupemail, saveuphn, saveuppassword } = req.body

    db.collection('users').add({ 'Name': saveupname, 'email': saveupemail, 'numberHN': saveuphn, 'password': saveuppassword }).then(function (docRef) {
        console.log(docRef.id)
        db.collection('users').doc(docRef.id).update({ 'uid': docRef.id })
    })

    res.send('/home')

})

app.put('/edit2/:id', function (req, res) {
    const { saveupphoto, saveupnameE, saveupnameT, susize, suunit, sudes, sueat, sucau, supro, suSE, sumore } = req.body
    const id = req.params.id
    db.collection('medpill').doc(id).update({
        'nameE': saveupnameE, 'nameT': saveupnameT, 'tablet': susize, 'image': saveupphoto,
        'unit': suunit, 'descrip': sudes, 'size': sueat, 'SE': suSE, 'cautions': sucau,
        'prohibition': supro, 'more': sumore
    })
    res.send('/pill')

})

app.post('/add2', function (req, res) {
    const { saveupphoto, saveupnameE, saveupnameT, susize, suunit, sudes, sueat, sucau, supro, suSE, sumore } = req.body
    console.log(req.body.saveupphoto)

    db.collection('medpill').add({
        'nameE': saveupnameE, 'nameT': saveupnameT, 'tablet': susize, 'image': saveupphoto,
        'unit': suunit, 'descrip': sudes, 'size': sueat, 'SE': suSE, 'cautions': sucau,
        'prohibition': supro, 'more': sumore
    }).then(function (docRef) {
        console.log(docRef.id)
        db.collection('medpill').doc(docRef.id).update({ 'uid': docRef.id })
    })

    res.send('/pill')

})

app.post('/upload', upload.single('fileupload'), (req, res) => {
    const metadata = { metadata: { firebaseStorageDownloadTokens: uuid() }, contentType: 'image/png', cachesControl: 'public:max-age=31536000' }
    bucket.upload(req.file.path, { gzip: true, metadata: metadata })
})


app.listen(8082);
console.log("Run server")