import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export default function AttendanceTable({ attendances }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAttendances = attendances.filter((attendance) => {
    const attendanceDate = attendance.timeStamp.toDate();
    attendanceDate.setHours(0, 0, 0, 0);
    return attendanceDate.getTime() === today.getTime();
  });

  const sortedAttendances = todayAttendances.sort(
    (a, b) => b.timeStamp.toDate() - a.timeStamp.toDate()
  );
  return (
    <TableContainer component={Paper}>
      <Table
        sx={{ minWidth: 650, border: "1px solid black" }}
        size="small"
        aria-label="simple table"
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ border: "1px solid black", textAlign: "center" }}>
              PID
            </TableCell>
            <TableCell sx={{ border: "1px solid black", textAlign: "center" }}>
              Full Name
            </TableCell>
            <TableCell sx={{ border: "1px solid black", textAlign: "center" }}>
              Clock-In
            </TableCell>
            <TableCell sx={{ border: "1px solid black", textAlign: "center" }}>
              Clock-Out
            </TableCell>
            <TableCell
              sx={{ border: "1px solid black", textAlign: "center" }}
              colSpan={2}
            >
              Lunch
            </TableCell>
            <TableCell
              sx={{ border: "1px solid black", textAlign: "center" }}
              colSpan={2}
            >
              Meeting
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              sx={{ border: "1px solid black", textAlign: "center" }}
              colSpan={4}
            ></TableCell>
            <TableCell sx={{ border: "1px solid black", textAlign: "center" }}>
              Clock-In
            </TableCell>
            <TableCell sx={{ border: "1px solid black", textAlign: "center" }}>
              Clock-Out
            </TableCell>
            <TableCell sx={{ border: "1px solid black", textAlign: "center" }}>
              Clock-In
            </TableCell>
            <TableCell sx={{ border: "1px solid black", textAlign: "center" }}>
              Clock-Out
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedAttendances.map((attendance) => (
            <TableRow key={attendance.id}>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
                component="th"
                scope="row"
              >
                {attendance.PID}
              </TableCell>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
              >
                {attendance.fullName}
              </TableCell>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
              >
                {attendance.timeStamp.toDate().toLocaleString()}
              </TableCell>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
              >
                {attendance.timeOut
                  ? attendance.timeOut.toDate().toLocaleString()
                  : ""}
              </TableCell>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
              >
                {attendance.lunchIn
                  ? attendance.lunchIn.toDate().toLocaleString()
                  : ""}
              </TableCell>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
              >
                {attendance.lunchOut
                  ? attendance.lunchOut.toDate().toLocaleString()
                  : ""}
              </TableCell>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
              >
                {attendance.meetingIn
                  ? attendance.meetingIn.toDate().toLocaleString()
                  : ""}
              </TableCell>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
              >
                {attendance.meetingOut
                  ? attendance.meetingOut.toDate().toLocaleString()
                  : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
