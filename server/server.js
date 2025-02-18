const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const QRCode = require('qrcode')
const uuid = require('uuid');

const app = express();
const cors = require('cors');
app.use(cors(
    {
        origin:["https://beckn-qr.vercel.app/"],
        methods: ["POST","GET"],
        credentials:true
    }
))

app.use(bodyParser.json());
app.use(express.static('public'));
function generateUniqueId() {
    return uuid.v4();
}
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });

// MongoDB setup and schema definition

mongoose.set('strictQuery',false);

mongoose.connect('mongodb://mongo:27017/beckn').then(() => {
    app.listen(5000, '0.0.0.0', () => {
        console.log("Server is listening on 0.0.0.0:5000");
    });
    console.log("Connected!");
}).catch((error) => {
    console.log(error);
});

const dataSchema = new mongoose.Schema({
    uniqueId: String, // Unique identifier for each data entry
    jsonData: Object // The actual JSON data
});

const DataModel = mongoose.model('Data', dataSchema);

// Admin posts JSON data to generate QR code
app.post('/qrGenerator', async (req, res) => {
    const jsonData = req.body;

    // Save the data in the database and generate a unique identifier
    const uniqueId = generateUniqueId(); // Implement your own unique ID generation
    const dataEntry = new DataModel({
        uniqueId,
        jsonData
    });

    await dataEntry.save();


    res.send({ success: true, uniqueId });
});

// User scans QR code to retrieve and display data
app.get('/getData/:id', async (req, res) => {
    const uniqueId = req.params.id;

    // Retrieve data from the database based on the unique identifier
    const dataEntry = await DataModel.findOne({ uniqueId });

    if (dataEntry) {
        res.json(dataEntry.jsonData); // Send the JSON data as the response
    } else {
        res.status(404).send("Data not found.");
    }
});

