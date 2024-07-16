import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const LateCount = ({ lateLunches }) => {
  if (!lateLunches || lateLunches.length === 0) {
    return (
      <div className="container">
        <h1>Late Lunch Time</h1>
        <p>No late lunches recorded today.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Late Lunch Time</h1>
      <p>
        This table shows the employees that have taken over 1 minute for their
        lunch time today.
      </p>

      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="late lunch table"
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
              >
                PID
              </TableCell>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
              >
                Full Name
              </TableCell>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
                colSpan={2}
              >
                Lunch
              </TableCell>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
              >
                Lunch Duration (mins)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
                colSpan={2}
              ></TableCell>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
              >
                Clock-In
              </TableCell>
              <TableCell
                sx={{ border: "1px solid black", textAlign: "center" }}
              >
                Clock-Out
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lateLunches.map((lunch, index) => (
              <TableRow key={index}>
                <TableCell
                  sx={{ border: "1px solid black", textAlign: "center" }}
                >
                  {lunch.PID}
                </TableCell>
                <TableCell
                  sx={{ border: "1px solid black", textAlign: "center" }}
                >
                  {lunch.fullName}
                </TableCell>
                <TableCell
                  sx={{ border: "1px solid black", textAlign: "center" }}
                >
                  {lunch.lunchIn}
                </TableCell>
                <TableCell
                  sx={{ border: "1px solid black", textAlign: "center" }}
                >
                  {lunch.lunchOut}
                </TableCell>
                <TableCell
                  sx={{ border: "1px solid black", textAlign: "center" }}
                >
                  {lunch.lunchDuration}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default LateCount;
