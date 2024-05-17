//DB Connection
const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const cors = require('cors'); // Add this line

const app = express()
const port = process.env.PORT || 5005

const path = require("path");
const multer = require("multer");

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

//=================== LOGIN API =====================//

app.post('/login', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            return res.status(500).send('Internal server error');
        }

        console.log(`LOGIN as [connectionID=${connection.threadId}]`);

        connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username,password], (err, result) => {
            connection.release();

            if (err) {
                console.error('Error executing MySQL query: ', err);
                return res.status(500).json('Error logging in');
            }

            if (result.affectedRows === 0) {
                return res.status(404).json(`LOGIN data not found`);
            }
            console.log(`LOGIN SUCCESS [connectionID=${connection.threadId}]`);
            return res.send(result)
        });
    });
});


app.post('/my_account/:id', (req, res) => {
    const id = req.params.id;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).json('Internal server error');
            return;
        }

        console.log(`Get My Account Data [connectionID=${connection.threadId}]`)

        connection.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
            connection.release();
            
            if (err) {
                return res.status(404).json(`User with id ${id} not found`);
            }

            return res.send(result);
        });
    });
});

app.post('/check_password/:id', (req, res) => {
    const id = req.params.id;
    const params = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).json('Internal server error');
            return;
        }

        console.log(`Check User Password is Correct [connectionID=${connection.threadId}]`)

        connection.query('SELECT * FROM users WHERE id = ? and password = ?', [id,params.password], (err, result) => {
            connection.release();
            
            if (err) {
                return res.status(404).json(`User with id ${id} not found`);
            }

            return res.send(result);
        });
    });
});


app.post('/update_password/:id', (req, res) => {
    const id = req.params.id;
    const params = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).json('Internal server error');
            return;
        }

        console.log(`UPDATE User Password  [connectionID=${connection.threadId}]`)

        connection.query('UPDATE users SET ? WHERE id = ?', [params,id], (err, result) => {
            connection.release();
            
            if (err) {
                return res.status(404).json(`User with id ${id} not found`);
            }

            return res.status(200).json(`Updated Password using user id ${id}`);
        });
    });
});

app.post('/update_myaccount/:id', (req, res) => {
    const id = req.params.id;
    const params = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).json('Internal server error');
            return;
        }

        console.log(`UPDATE User Account  [connectionID=${connection.threadId}]`)

        connection.query('UPDATE users SET ? WHERE id = ?', [params,id], (err, result) => {
            connection.release();
            
            if (err) {
                return res.status(404).json(`User with id ${id} not found`);
            }

            return res.status(200).json(`Updated Account using user id ${id}`);
        });
    });
});


//=================== Teacher API =====================//

// Get all teacher
    app.get('/teacher', (_, res) => { // Change req to _
        pool.getConnection((err, connection) => {
            if (err) throw err
            console.log(`Get List of Teachers [connectionID=${connection.threadId}]`)

            connection.query('SELECT * from users where user_type="teacher"', (err, rows) => {
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
    app.delete('/delete_teacher/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`Connected as thread ID ${connection.threadId}`);

            connection.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
                connection.release();

                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting teacher');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Teacher with id ${id} not found`);
                }

                return res.status(200).json(`Teacher with id ${id} has been deleted`);
            });
        });
    });


    // Update teacher
    app.put('/update_teacher/:id', (req, res) => {
        const id = req.params.id;
        const updatedTeacher = req.body;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).json('Internal server error');
                return;
            }

            console.log(`Connected as thread ID ${connection.threadId}`);

            connection.query('UPDATE users SET ? WHERE id = ?', [updatedTeacher, id], (err, result) => {
                connection.release();

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Teacher with id ${id} not found`);
                }

                return res.status(200).json(`Teacher with id ${id} has been deleted`);
            });
        });
    });

    
    // Add Teacher
    app.post('/add_teacher', (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).send('Internal server error');
                return;
            }

            console.log(`Add Teacher [connectionID=${connection.threadId}]`);
            const params = req.body;

            connection.query('INSERT INTO users SET user_type="teacher",?', params, (err, result) => {
                connection.release();

                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    res.status(500).send('Error adding teacher');
                    return;
                }

                res.status(201).json(`{ message: Teacher with the name: ${params.firstname} has been added. }`);
            });
        });
    });

    // Get all teacher class
     app.post('/teacher_class/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).json('Internal server error');
                return;
            }

            console.log(`GET TEACHER CLASS = thread ID ${connection.threadId}`);

            connection.query('SELECT * FROM v_rostered_schedule WHERE teacher_id = ?', [id], (err, result) => {
                connection.release();

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Teacher Roster with id ${id} not found`);
                }

                return res.send(result);
            });
        });
    });

//=================== SECTION API =====================//

    // Get all section
    app.get('/section', (_, res) => { // Change req to _
        pool.getConnection((err, connection) => {
            if (err) throw err
            console.log(`Get List of Section [connectionID=${connection.threadId}]`)

            connection.query('SELECT * from section', (err, rows) => {
                connection.release() // return the connection to pool

                if (!err) {
                    res.send(rows)
                } else {
                    console.log(err)
                }

            })
        })
    });

    // Get all section
    app.get('/get_subject', (_, res) => { // Change req to _
        pool.getConnection((err, connection) => {
            if (err) throw err
            console.log(`Get List of Subject [connectionID=${connection.threadId}]`)

            connection.query('SELECT * from subject', (err, rows) => {
                connection.release() // return the connection to pool

                if (!err) {
                    res.send(rows)
                } else {
                    console.log(err)
                }

            })
        })
    });

//=================== COUNT STUDENT AND TEACHERS API =====================//

    // Get count total students
    app.get('/count_student', (_, res) => { // Change req to _
        pool.getConnection((err, connection) => {
            if (err) throw err
            console.log(`Get Count of Students [connectionID=${connection.threadId}]`)

            connection.query('SELECT count(*) as count from users where user_type="student"', (err, rows) => {
                connection.release() // return the connection to pool

                if (!err) {
                    res.send(rows)
                } else {
                    console.log(err)
                }

            })
        })
    });

    // Get count total teacher
    app.get('/count_teacher', (_, res) => { // Change req to _
        pool.getConnection((err, connection) => {
            if (err) throw err
            console.log(`Get Count of Teacher [connectionID=${connection.threadId}]`)

            connection.query('SELECT count(*) as count from users where user_type="teacher"', (err, rows) => {
                connection.release() // return the connection to pool

                if (!err) {
                    res.send(rows)
                } else {
                    console.log(err)
                }

            })
        })
    });



//=================== Student API =====================//

    // Get all student
    app.get('/student', (_, res) => { // Change req to _
        pool.getConnection((err, connection) => {
            if (err) throw err
            console.log(`Get List of Students [connectionID=${connection.threadId}]`)

            connection.query('SELECT * from v_users_student_section where user_type="student"', (err, rows) => {
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
    app.delete('/delete_student/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`Connected as thread ID ${connection.threadId}`);

            connection.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
                connection.release();

                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting student');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Student with ID ${id} not found`);
                }

                return res.status(200).json(`Student with ID ${id} has been deleted`);
            });
        });
    });


    // Update student
    app.put('/update_student/:id', (req, res) => {
        const id = req.params.id;
        const updatedStudent = req.body;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).json('Internal server error');
                return;
            }

            console.log(`Connected as thread ID ${connection.threadId}`);

            connection.query('UPDATE users SET ? WHERE id = ?', [updatedStudent, id], (err, result) => {
                connection.release();

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Student with id ${id} not found`);
                }

                return res.status(200).json(`Student with id ${id} has been deleted`);
            });
        });
    });

    
    // Add Student
    app.post('/add_student', (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).send('Internal server error');
                return;
            }

            console.log(`Connected as thread ID ${connection.threadId}`);
            const params = req.body;

            connection.query('INSERT INTO users SET user_type="student",?', params, (err, result) => {
                connection.release();

                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    res.status(500).send('Error adding student');
                    return;
                }

                res.status(201).json(`{ message: Student with the name: ${params.firstname} has been added. }`);
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
    app.get('/class_schedule', (_, res) => {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log(`get class_schedule [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM v_schedule_subject_section', (err, rows) => {
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
                        const class_days = row.class_days.split(',').map(day => day.trim());

                        const formattedData = {
                            ...row,
                            class_days: class_days, // Assign the trimmed and split array
                            class_start: formatTime(row.class_start),
                            class_end: formatTime(row.class_end),
                            class_section: row.class_section_id,
                            class_subject: row.class_subject_id,
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
    app.post('/add_schedule', (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).send('Internal server error');
                return;
            }

            console.log(`Add Schedule [connectionID=${connection.threadId}]`);
            const subjectData = req.body;

            connection.query('INSERT INTO schedule SET ?', subjectData, (err, result) => {
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
    app.put('/update_schedule/:id', (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).send('Internal server error');
                return;
            }

            console.log(`UPDATE Schedule [connectionID=${connection.threadId}]`);
            const id = req.params.id; // Extract ID from route parameters
            const subjectData = req.body;

            connection.query('UPDATE schedule SET ? WHERE id = ?', [subjectData, id], (err, result) => {
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
    app.delete('/delete_schedule/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`Delete Schedule [connectionID=${connection.threadId}]`);

            connection.query('DELETE FROM schedule WHERE id = ?', [id], (err, result) => {
                connection.release();

                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting schedule');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`schedule with ID ${id} not found`);
                }

                return res.status(200).json(`schedule with ID ${id} has been deleted`);
            });
        });
    });


//-------------- Roster Schedule API ------------------//
    
    // Get All Roster Schedule
    app.get('/rostered', (_, res) => {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log(`get roster [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM v_rostered_schedule', (err, rows) => {
                connection.release(); // return the connection to the pool

                if (!err) {
                    res.send(rows);
                } else {
                    res.status(500).send('Error fetching class roster');
                }
            });
        });
    });

    // Get All Schedule for ROSTER
    app.get('/schedule_roster', (_, res) => {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log(`get schedule for roster [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM v_schedule_for_roster', (err, rows) => {
                connection.release(); // return the connection to the pool

                if (!err) {
                    res.send(rows);
                } else {
                    res.status(500).send('Error fetching class v_schedule_for_roster');
                }
            });
        });
    });

    app.post('/add_roster', (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).send('Internal server error');
                return;
            }

            console.log(`Add Roster [connectionID=${connection.threadId}]`);
            const params = req.body;

            connection.query('INSERT INTO roster SET ?', params, (err, result) => {
                connection.release();

                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    res.status(500).send('Error adding teacher');
                    return;
                }

                res.status(201).json(`{ message: Roster has been added. }`);
            });
        });
    });

     // Update ROSTER
     app.put('/update_roster/:id', (req, res) => {
        const id = req.params.id;
        const updatedRoster = req.body;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).json('Internal server error');
                return;
            }

            console.log(`UPDATE ROSTER [connectionID=${connection.threadId}]`);

            connection.query('UPDATE roster SET ? WHERE id = ?', [updatedRoster, id], (err, result) => {
                connection.release();

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Roster with id ${id} not found`);
                }

                return res.status(200).json(`Roster with id ${id} has been updated`);
            });
        });
    });

    //Delete Roster
    app.delete('/delete_roster/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`DELETE ROSTER [connectionID=${connection.threadId}]`);

            connection.query('DELETE FROM roster WHERE id = ?', [id], (err, result) => {
                connection.release();

                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting teacher');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Roster with id ${id} not found`);
                }

                return res.status(200).json(`Roster with id ${id} has been deleted`);
            });
        });
    });

    app.post('/add_roster_pin', (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).send('Internal server error');
                return;
            }

            console.log(`Add Roster PIN [connectionID=${connection.threadId}]`);
            const params = req.body;

            connection.query('INSERT INTO roster_pin SET ?', params, (err, result) => {
                connection.release();

                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    res.status(500).send('Error adding teacher');
                    return;
                }

                res.send(result);
            });
        });
    });

    // Get All Schedule for ROSTER
    app.get('/get_latest_roster_pin', (_, res) => {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log(`get schedule for roster [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM roster_pin GROUP BY roster_id ORDER BY id DESC', (err, rows) => {
                connection.release(); // return the connection to the pool

                if (!err) {
                    res.send(rows);
                } else {
                    res.status(500).send('Error fetching class v_schedule_for_roster');
                }
            });
        });
    });

    app.post('/check_roster_pin', (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).send('Internal server error');
                return;
            }

            console.log(`SELECT Roster PIN [connectionID=${connection.threadId}]`);
            const params = req.body;

            connection.query('SELECT * FROM roster_pin WHERE pin=? AND roster_date=? AND roster_id=?', [params.pin,params.roster_date,params.roster_id], (err, result) => {
                connection.release();

                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    res.status(500).send('Error checking check_roster_pin');
                    return;
                }

                res.send(result);
            });
        });
    });

    app.post('/roster_pin_alerts_per_id/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET roster_pin_alerts_per_id [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM v_rostered_pin_alerts_student_list WHERE alert_id=?', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting teacher');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Roster PIN alerts with id ${id} not found`);
                }

                return res.send(result);
            });
        });
    });

    app.post('/update_roster_pin_alerts_attendance/:id', (req, res) => {
        const id = req.params.id;
        const params = req.body;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET update_roster_pin_alerts_attendance [connectionID=${connection.threadId}]`);

            connection.query('UPDATE roster_pin_alerts SET ? WHERE id=?', [params,id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error update_roster_pin_alerts_attendance');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Attendance PIN alerts with id ${id} not found`);
                }

                return res.status(201).json(`{ message: Attendance has been updated. }`);
            });
        });
    });

    
    app.post('/update_roster_pin_alerts_attendance_student', (req, res) => {

        const params = req.body;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET update_roster_pin_alerts_attendance [connectionID=${connection.threadId}]`);

            connection.query('UPDATE roster_pin_alerts SET ? WHERE student_id=? AND roster_pin_id=?', [params,params.student_id,params.roster_pin_id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error update_roster_pin_alerts_attendance');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Attendance PIN alerts with id ${id} not found`);
                }

                return res.status(201).json(`{ message: Attendance has been updated. }`);
            });
        });
    });


    app.post('/roster_pin_alerts_per_section/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET roster_pin_alerts_per_section [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM v_rostered_pin_alerts_student_list WHERE roster_pin_id=?', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting teacher');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Roster PIN alerts with id ${id} not found`);
                }

                return res.send(result);
            });
        });
    });

    app.post('/roster_pin_alerts_per_roster_student/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET roster_pin_alerts_per_section [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM `v_rostered_pin_alerts_student_list` WHERE alert_id IN (SELECT MAX(u.alert_id) as alert_id FROM v_rostered_pin_alerts_student_list u GROUP BY roster_id,student_id ) AND student_id=?', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting teacher');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Roster PIN alerts Student List with id ${id} not found`);
                }

                return res.send(result);
            });
        });
    }); 

    app.post('/roster_pin_per_teacher/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET v_rostered_pin_by_teacher [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM v_rostered_pin_by_teacher WHERE teacher_id=?', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting teacher');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Roster PIN with id ${id} not found`);
                }

                return res.send(result);
            });
        });
    });

    app.post('/roster_pin_per_teacher_today/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET v_rostered_pin_by_teacher [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM v_rostered_pin_by_teacher WHERE roster_date=CURDATE() and teacher_id=?', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting teacher');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Roster PIN with id ${id} not found`);
                }

                return res.send(result);
            });
        });
    });

    app.post('/students_per_section/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET students_per_section [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM users WHERE student_class_section=?', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting teacher');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Students Per Section with id ${id} not found`);
                }

                return res.send(result);
            });
        });
    });

    app.post('/students_per_teacher/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET students_per_teacher [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM v_rostered_pin_alerts_student_list WHERE teacher_id=?', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting teacher');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Students Per Teacher with id ${id} not found`);
                }

                return res.send(result);
            });
        });
    });

    app.post('/students_per_student/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET students_per_student [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM v_rostered_pin_alerts_student_list WHERE student_id=?', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting teacher');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Students Per Student with id ${id} not found`);
                }

                return res.send(result);
            });
        });
    });

    app.post('/notification_alerts_for_teachers/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET notification_alerts_for_teachers [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM v_response_notif_for_teacher WHERE teacher_id=? AND is_read=0 ORDER BY id desc', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error notification_alerts_for_teachers');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Notification Per Teacher with id ${id} not found`);
                }

                return res.send(result);
            });
        });
    });

    app.post('/update_read_notification_teacher_alerts/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET notification_alerts_for_teachers [connectionID=${connection.threadId}]`);

            connection.query('UPDATE response_students_alerts SET is_read=1 WHERE id=?', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error update notification_alerts_for_teachers');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Update Notification Read Status with id ${id} not found`);
                }

                return res.status(201).json(`{ message: Update Notification has been read. }`);
            });
        });
    });


    app.post('/notification_alerts_for_students/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET notification_alerts_for_students [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM v_rostered_pin_alerts_student_list WHERE student_id=? AND is_read=0 ORDER BY alert_id desc', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error notification_alerts_for_students');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Notification Per Student with id ${id} not found`);
                }

                return res.send(result);
            });
        });
    });

    app.post('/update_read_notification_alerts/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET notification_alerts_for_students [connectionID=${connection.threadId}]`);

            connection.query('UPDATE roster_pin_alerts SET is_read=1 WHERE id=?', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error update roster_pin_alerts');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`Update Notification Read Status with id ${id} not found`);
                }

                return res.status(201).json(`{ message: Update Notification has been read. }`);
            });
        });
    });

    app.post('/add_roster_pin_alerts', (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).send('Internal server error');
                return;
            }

            console.log(`Add Roster PIN [connectionID=${connection.threadId}]`);
            const params = req.body;

            connection.query('INSERT INTO roster_pin_alerts SET ?', params, (err, result) => {
                connection.release();

                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).send('Error adding teacher');
                }

                return res.status(201).json(`{ message: Roster Pin Alerts has been added. }`);
            });
        });
    });

    app.post('/add_response_students_alerts', (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                res.status(500).send('Internal server error');
                return;
            }

            console.log(`Add Response from Students [connectionID=${connection.threadId}]`);
            const params = req.body;

            connection.query('INSERT INTO response_students_alerts SET ?', params, (err, result) => {
                connection.release();

                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).send('Error adding teacher');
                }

                return res.status(201).json(`{ message: Response From Students has been added. }`);
            });
        });
    });

    // STUDENT MODULE
    app.post('/roster_schedule_per_student/:id', (req, res) => {
        const id = req.params.id;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MySQL connection: ', err);
                return res.status(500).send('Internal server error');
            }

            console.log(`GET v_rostered_schedule_per_student [connectionID=${connection.threadId}]`);

            connection.query('SELECT * FROM v_rostered_schedule_per_student WHERE user_id=? AND roster_id is not null', [id], (err, result) => {
                connection.release();
                if (err) {
                    console.error('Error executing MySQL query: ', err);
                    return res.status(500).json('Error deleting teacher');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json(`v_rostered_schedule_per_student with id ${id} not found`);
                }

                return res.send(result);
            });
        });
    });

//-------------- Upload Images API ------------------//

// View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
 
// var upload = multer({ dest: "Upload_folder_name" })
// If you do not want to use diskStorage then uncomment it
 
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Uploads is the Upload_folder_name
        cb(null, "D:/WorkFiles/AttendEase/src/assets/images/uploaded/");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    },
});
 
// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 5 * 1000 * 1000;
 
var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);
 
        var extname = filetypes.test(
            path.extname(file.originalname).toLowerCase()
        );
 
        if (mimetype && extname) {
            return cb(null, true);
        }
 
        cb(
            "Error: File upload only supports the " +
                "following filetypes - " +
                filetypes
        );
    },
 
    // mypic is the name of file attribute
}).single("file");
 
app.post("/uploadProfilePicture", function (req, res, next) {
    // Error MiddleWare for multer file upload, so if any
    // error occurs, the image would not be uploaded!

    // console.log('res',res);
    upload(req, res, function (err) {
        if (err) {
            res.send(err);
        } else {
            let file_array = [{
                "filename":req.file.filename
            }];
            res.send(file_array); 
        }
    });
});
 
 
// Listen on enviroment port or 5005
app.listen(port, () => console.log(`Listen on port ${port}`))