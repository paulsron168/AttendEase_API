//DB Connection
const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const cors = require('cors'); // Add this line

const app = express()
const port = process.env.PORT || 5005

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

// Enable CORS
app.use(cors()); // Add this line

// MySQL
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'time_management'
}) 


//=================== Teacher API =====================//

// Get all teacher
app.get('/teacher', (_, res) => { // Change req to _
    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as TeacherID_Number ${connection.threadId}`)

        connection.query('SELECT * from teacher', (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }

        })
    })
})


//Delete Teacher
app.delete('/teacher/:ID', (req, res) => {
    const ID = req.params.ID;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            return res.status(500).send('Internal server error');
        }

        console.log(`Connected as thread ID ${connection.threadId}`);

        connection.query('DELETE FROM teacher WHERE ID = ?', [ID], (err, result) => {
            connection.release();

            if (err) {
                console.error('Error executing MySQL query: ', err);
                return res.status(500).json('Error deleting teacher');
            }

            if (result.affectedRows === 0) {
                return res.status(404).json(`Teacher with ID ${ID} not found`);
            }

            return res.status(200).json(`Teacher with ID ${ID} has been deleted`);
        });
    });
});


// Update teacher
app.put('/teacher/:TeacherID_Number', (req, res) => {
    const TeacherID_Number = req.params.TeacherID_Number;
    const updatedTeacher = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).json('Internal server error');
            return;
        }

        console.log(`Connected as thread ID ${connection.threadId}`);

        connection.query('UPDATE teacher SET ? WHERE TeacherID_Number = ?', [updatedTeacher, TeacherID_Number], (err, result) => {
            connection.release();

            if (result.affectedRows === 0) {
                return res.status(404).json(`Teacher with TeacherID_Number ${TeacherID_Number} not found`);
            }

            return res.status(200).json(`Teacher with TeacherID_Number ${TeacherID_Number} has been deleted`);
        });
    });
});

 
// Add Teacher
app.post('/addteacher', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).send('Internal server error');
            return;
        }

        console.log(`Connected as thread ID ${connection.threadId}`);
        const params = req.body;

        connection.query('INSERT INTO teacher SET ?', params, (err, result) => {
            connection.release();

            if (err) {
                console.error('Error executing MySQL query: ', err);
                res.status(500).send('Error adding teacher');
                return;
            }

            res.status(201).json(`{ message: Teacher with the name: ${params.First_Name} has been added. }`);
        });
    });
});


//=================== Student API =====================//

// Get all student
app.get('/student', (_, res) => { // Change req to _
    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as StudentID_Number ${connection.threadId}`)

        connection.query('SELECT * from student', (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }

        })
    })
})


//Delete Student
app.delete('/student/:ID', (req, res) => {
    const ID = req.params.ID;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            return res.status(500).send('Internal server error');
        }

        console.log(`Connected as thread ID ${connection.threadId}`);

        connection.query('DELETE FROM student WHERE ID = ?', [ID], (err, result) => {
            connection.release();

            if (err) {
                console.error('Error executing MySQL query: ', err);
                return res.status(500).json('Error deleting student');
            }

            if (result.affectedRows === 0) {
                return res.status(404).json(`Student with ID ${ID} not found`);
            }

            return res.status(200).json(`Student with ID ${ID} has been deleted`);
        });
    });
});


// Update student
app.put('/student/:StudentID_Number', (req, res) => {
    const StudentID_Number = req.params.StudentID_Number;
    const updatedStudent = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).json('Internal server error');
            return;
        }

        console.log(`Connected as thread ID ${connection.threadId}`);

        connection.query('UPDATE student SET ? WHERE StudentID_Number = ?', [updatedStudent, StudentID_Number], (err, result) => {
            connection.release();

            if (result.affectedRows === 0) {
                return res.status(404).json(`Student with StudentID_Number ${StudentID_Number} not found`);
            }

            return res.status(200).json(`Student with StudentID_Number ${StudentID_Number} has been deleted`);
        });
    });
});

 
// Add Student
app.post('/addstudent', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).send('Internal server error');
            return;
        }

        console.log(`Connected as thread ID ${connection.threadId}`);
        const params = req.body;

        connection.query('INSERT INTO student SET ?', params, (err, result) => {
            connection.release();

            if (err) {
                console.error('Error executing MySQL query: ', err);
                res.status(500).send('Error adding student');
                return;
            }

            res.status(201).json(`{ message: Student with the name: ${params.First_Name} has been added. }`);
        });
    });
});


//=================== Subject API =====================//

// Get all Subject

app.get('/subject', (_, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connected as subjectID ${connection.threadId}`);

        connection.query('SELECT *, GROUP_CONCAT(year_level) AS year_level FROM subject GROUP BY subjectCode', (err, rows) => {
            connection.release(); // return the connection to the pool

            if (!err) {
                // Map over the rows and convert the year_level field to an array
                const data = rows.map(row => {
                    const academicLevels = row.year_level.split(',').map(level => level.trim()); // Split and trim each academic level
                    return {
                        ...row,
                        year_level: academicLevels // Convert year_level to array
                    };
                });
                res.send(data);
            } else {
                console.log(err);
            }
        });
    });
});


// Add Subject
app.post('/addsubjects', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).send('Internal server error');
            return;
        }

        console.log(`Connected as thread ID ${connection.threadId}`);
        const subjectData = req.body;

        if (!subjectData.year_level || !Array.isArray(subjectData.year_level) || subjectData.year_level.length === 0) {
            res.status(400).json({ error: 'No academic levels provided or invalid format.' });
            return;
        }

        const subject = {
            year_level: subjectData.year_level.join(', '), // Join all year levels into a single string
            description: subjectData.description,
            major: subjectData.major,
            subject: subjectData.subject,
            subjectCode: subjectData.subjectCode,
            type: subjectData.type,
            units: subjectData.units
        };

        connection.query('INSERT INTO subject SET ?', subject, (err, result) => {
            connection.release();
            if (err) {
                console.error('Error executing MySQL query: ', err);
                res.status(500).send('Error adding subjects');
            } else {
                res.status(201).json({ message: 'Subject has been added.' });
            }
        });
    });
});

// Update Subject
app.put('/subject/:subjectID', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).send('Internal server error');
            return;
        }

        console.log(`Connected as thread ID ${connection.threadId}`);
        const subjectID = req.params.subjectID; // Extract subjectID from route parameters
        const subjectData = req.body;

        if (!subjectData.year_level || !Array.isArray(subjectData.year_level) || subjectData.year_level.length === 0) {
            res.status(400).json({ error: 'No academic levels provided or invalid format.' });
            return;
        }

        const subject = {
            year_level: subjectData.year_level.join(', '), // Join all academic levels into a single string
            description: subjectData.description,
            major: subjectData.major,
            subject: subjectData.subject,
            subjectCode: subjectData.subjectCode,
            type: subjectData.type,
            units: subjectData.units
        };

        connection.query('UPDATE subject SET ? WHERE subjectID = ?', [subject, subjectID], (err, result) => {
            connection.release();
            if (err) {
                console.error('Error executing MySQL query: ', err);
                res.status(500).send('Error updating subject');
            } else {
                if (result.affectedRows > 0) {
                    res.status(200).json({ message: 'Subject has been updated.' });
                } else {
                    res.status(404).json({ error: 'Subject not found.' });
                }
            }
        });
    });
});


//Delete Subject
app.delete('/subject/:subjectCode', (req, res) => {
    const subjectCode = req.params.subjectCode;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            return res.status(500).send('Internal server error');
        }

        console.log(`Connected as thread ID ${connection.threadId}`);

        connection.query('DELETE FROM subject WHERE subjectCode = ?', [subjectCode], (err, result) => {
            connection.release();

            if (err) {
                console.error('Error executing MySQL query: ', err);
                return res.status(500).json('Error deleting student');
            }

            if (result.affectedRows === 0) {
                return res.status(404).json(`Subject with ID ${subjectCode} not found`);
            }

            return res.status(200).json(`Subject with ID ${subjectCode} has been deleted`);
        });
    });
});



//-------------- Class Schedule API ------------------//

// Function to format time to HH:mm:ss format
function formatTime(time) {
    // Assuming time is in 'HH:mm AM/PM' format
    const [hourMinute, ampm] = time.split(' ');
    let [hour, minute] = hourMinute.split(':');

    // Convert hour to 24-hour format if PM
    if (ampm.toUpperCase() === 'PM') {
        hour = (parseInt(hour, 10) + 12).toString(); // Add 12 hours for PM
    }

    // Pad hour and minute with leading zeros if needed
    hour = hour.padStart(2, '0');
    minute = minute.padStart(2, '0');

    return `${hour}:${minute}:00`; // Append seconds
}


// Get All Class Schedule
app.get('/classschedule', (_, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connected as class_ID ${connection.threadId}`);

        connection.query('SELECT *, GROUP_CONCAT(class_Day) AS class_Day FROM classschedule GROUP BY class_ID', (err, rows) => {
            connection.release(); // return the connection to the pool

            if (!err) {
                // Map over the rows and convert the time format for class_Start and class_End
                const data = rows.map(row => {
                    // Format class_Start and class_End to HH:mm AM/PM format
                    const formatTime = timeString => {
                        const time = new Date('1970-01-01T' + timeString);
                        return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    };

                    // Trim and split the class_Day string to an array
                    const class_Days = row.class_Day.split(',').map(day => day.trim());

                    const formattedData = {
                        ...row,
                        class_Day: class_Days, // Assign the trimmed and split array
                        class_Start: formatTime(row.class_Start),
                        class_End: formatTime(row.class_End)
                    };

                    return formattedData;
                });

                res.send(data);
            } else {
                console.log(err);
                res.status(500).send('Error fetching class schedules');
            }
        });
    });
});


// Add Class Schedule
app.post('/addclassschedule', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).send('Internal server error');
            return;
        }

        console.log(`Connected as thread ID ${connection.threadId}`);
        const subjectData = req.body;

        if (!subjectData.class_Day || !Array.isArray(subjectData.class_Day) || subjectData.class_Day.length === 0) {
            res.status(400).json({ error: 'No class schedule provided or invalid format.' });
            return;
        }

        // Ensure class_Start and class_End are in HH:mm:ss format
        const classschedule = {
            class_Day: subjectData.class_Day.join(', '), // Join all academic levels into a single string
            class_ID: subjectData.class_ID,
            class_Start: formatTime(subjectData.class_Start),
            class_End: formatTime(subjectData.class_End),
            class_Section: subjectData.class_Section,
            room: subjectData.room,
        };

        connection.query('INSERT INTO classschedule SET ?', classschedule, (err, result) => {
            connection.release();
            if (err) {
                console.error('Error executing MySQL query: ', err);
                res.status(500).send('Error adding subjects');
            } else {
                res.status(201).json({ message: 'Class Schedule has been added.' });
            }
        });
    });
});



// Update Class Schedule
// Update Class Schedule
app.put('/classschedule/:ID', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).send('Internal server error');
            return;
        }

        console.log(`Connected as thread ID ${connection.threadId}`);
        const ID = req.params.ID; // Extract ID from route parameters
        const subjectData = req.body;

        if (!subjectData.class_Day || !Array.isArray(subjectData.class_Day) || subjectData.class_Day.length === 0) {
            res.status(400).json({ error: 'No class schedule provided or invalid format.' });
            return;
        }


        //Ensure class_Start and class_End are in HH:mm:ss format
        const classschedule = {
            class_Day: subjectData.class_Day.join(', '), // Join all academic levels into a single string
            class_ID: subjectData.class_ID,
            class_Start: formatTime(subjectData.class_Start),
            class_End: formatTime(subjectData.class_End),
            class_Section: subjectData.class_Section,
            room: subjectData.room,
        };

        connection.query('UPDATE classschedule SET ? WHERE ID = ?', [classschedule, ID], (err, result) => {
            connection.release();
            if (err) {
                console.error('Error executing MySQL query: ', err);
                res.status(500).send('Error updating subject');
            } else {
                if (result.affectedRows > 0) {
                    res.status(200).json({ message: 'Class Schedule has been updated.' });
                } else {
                    res.status(404).json({ error: 'Class Schedule not found.' });
                }
            }
        });
    });
});


//Delete Class Schedule
app.delete('/classSchedule/:class_ID', (req, res) => {
    const class_ID = req.params.class_ID;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            return res.status(500).send('Internal server error');
        }

        console.log(`Connected as thread ID ${connection.threadId}`);

        connection.query('DELETE FROM classSchedule WHERE class_ID = ?', [class_ID], (err, result) => {
            connection.release();

            if (err) {
                console.error('Error executing MySQL query: ', err);
                return res.status(500).json('Error deleting classSchedule');
            }

            if (result.affectedRows === 0) {
                return res.status(404).json(`classSchedule with ID ${class_ID} not found`);
            }

            return res.status(200).json(`classSchedule with ID ${class_ID} has been deleted`);
        });
    });
});



 
// Listen on enviroment port or 5005
app.listen(port, () => console.log(`Listen on port ${port}`))