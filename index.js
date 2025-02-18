const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

// MongoDB connection string from MongoDB Atlas (Replace with your actual string)
const mongoURI = 'mongodb+srv://domz:dom123@cluster0.6mxhr.mongodb.net/';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Define the Student schema
const studentSchema = new mongoose.Schema({
  sid: String,
  sname: String,
  semail: String,
  spass: String
});

// Create the Student model
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
        const newStudent = new Student({ sid, sname, semail, spass });
        await newStudent.save();
        res.status(201).json({ message: 'Student registered successfully', student: newStudent });
    } catch (err) {
        res.status(500).json({ message: 'Error registering student', error: err });
    }
});

// Login a student
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
        const student = await Student.findOne({ semail, spass });
        if (!student) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.status(200).json({ message: 'Login successful', student: { sid: student.sid, sname: student.sname, semail: student.semail } });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err });
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
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ student });
    } catch (err) {
        res.status(500).json({ message: 'Error searching for student', error: err });
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
        const student = await Student.findOne({ sid });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (sname) student.sname = sname;
        await student.save();

        res.status(200).json({ message: 'Profile updated successfully', student });
    } catch (err) {
        res.status(500).json({ message: 'Error updating profile', error: err });
    }
});

// Delete a student
app.delete('/delete/:sid', async (req, res) => {
    const { sid } = req.params;

    try {
        const student = await Student.findOneAndDelete({ sid });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting student', error: err });
    }
});

// Start the server on port 5000
app.listen(5000, () => console.log('Server running on port 5000'));
