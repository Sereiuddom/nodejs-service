const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 
const app = express();
app.use(express.json());


const mongoURI = 'mongodb+srv://domz:dom123@cluster0.6mxhr.mongodb.net/students';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.log('❌ Error connecting to MongoDB:', err));

mongoose.connection.on('connected', () => console.log('🔗 MongoDB Connection Successful'));
mongoose.connection.on('error', (err) => console.log('⚠️ MongoDB Error:', err));


const studentSchema = new mongoose.Schema({
  sid: { type: String, unique: true, required: true },
  sname: { type: String, required: true },
  semail: { type: String, unique: true, required: true },
  spass: { type: String, required: true } 
});


const Student = mongoose.model('Student', studentSchema);


/*
{
    "sid": "1",
    "sname": "Alice",
    "semail": "alice@example.com",
    "spass": "secure123"
}
*/
app.post('/register', async (req, res) => {
    const { sid, sname, semail, spass } = req.body;

    if (!sid || !sname || !semail || !spass) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(spass, 10); 
        const newStudent = new Student({ sid, sname, semail, spass: hashedPassword });

        await newStudent.save();
        res.status(201).json({ message: '✅ Student registered successfully', student: newStudent });
    } catch (err) {
        res.status(500).json({ message: '❌ Error registering student', error: err });
    }
});


/*
{
    "semail": "alice@example.com",
    "spass": "secure123"
}
*/
app.post('/login', async (req, res) => {
    const { semail, spass } = req.body;

    if (!semail || !spass) {
        return res.status(400).json({ message: 'Email and Password are required' });
    }

    try {
        const student = await Student.findOne({ semail });
        console.log("🔍 Login Attempt - Found Student:", student);

        if (!student) {
            return res.status(401).json({ message: '❌ Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(spass, student.spass);
        if (!isMatch) {
            return res.status(401).json({ message: '❌ Invalid email or password' });
        }

        res.status(200).json({ message: '✅ Login successful', student: { sid: student.sid, sname: student.sname, semail: student.semail } });
    } catch (err) {
        res.status(500).json({ message: '❌ Error logging in', error: err });
    }
});

// Search for a student by email
app.get('/search', async (req, res) => {
    const { semail } = req.query;

    if (!semail) {
        return res.status(400).json({ message: 'Email query parameter is required' });
    }

    try {
        const student = await Student.findOne({ semail });
        console.log("🔍 Search Result:", student);

        if (!student) {
            return res.status(404).json({ message: '❌ Student not found' });
        }

        res.status(200).json({ student });
    } catch (err) {
        res.status(500).json({ message: '❌ Error searching for student', error: err });
    }
});

// Update student profile
/*
{
    "sname": "John"
}
*/
app.put('/update/:sid', async (req, res) => {
    const { sid } = req.params;
    const { sname } = req.body;

    try {
        const student = await Student.findOneAndUpdate(
            { sid },
            { $set: { sname } },
            { new: true } 
        );

        console.log("📝 Update Result:", student);

        if (!student) {
            return res.status(404).json({ message: '❌ Student not found' });
        }

        res.status(200).json({ message: '✅ Profile updated successfully', student });
    } catch (err) {
        res.status(500).json({ message: '❌ Error updating profile', error: err });
    }
});

// Delete a student
app.delete('/delete/:sid', async (req, res) => {
    const { sid } = req.params;

    try {
        const student = await Student.findOneAndDelete({ sid });
        console.log("🗑️ Delete Result:", student);

        if (!student) {
            return res.status(404).json({ message: '❌ Student not found' });
        }

        res.status(200).json({ message: '✅ Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: '❌ Error deleting student', error: err });
    }
});

// Start the server on port 5000
app.listen(5000, () => console.log('🚀 Server running on port 5000'));  
