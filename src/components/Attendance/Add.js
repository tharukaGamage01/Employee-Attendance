import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../config/firestore";

const Add = ({ attendances, setAttendances, setIsAdding, getAttendances }) => {
  const [PID, setPID] = useState("");
  const [fullName, setFullName] = useState("");
  const [attendanceFlag, setAttendanceFlag] = useState("");

  const handleFetchFullName = async (e) => {
    e.preventDefault();

    if (!PID) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "PID is required.",
        showConfirmButton: true,
      });
    }

    const q = query(collection(db, "employees"), where("PID", "==", PID));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: `Employee with PID ${PID} does not exist.`,
        showConfirmButton: true,
      });
    }

    const employeeData = querySnapshot.docs[0].data();
    setFullName(`${employeeData.firstName} ${employeeData.lastName}`);
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (
      !PID ||
      !fullName ||
      (attendanceFlag !== "1" && attendanceFlag !== "0")
    ) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required, and attendance flag must be '1' or '0'.",
        showConfirmButton: true,
      });
    }

    if (attendanceFlag === "1") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "attendance"),
        where("PID", "==", PID),
        where("timeStamp", ">=", Timestamp.fromDate(startOfDay)),
        where("timeStamp", "<=", Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return Swal.fire({
          icon: "error",
          title: "Error!",
          text: `Attendance for PID ${PID} has already been added today.`,
          showConfirmButton: true,
        });
      }

      const newAttendance = {
        PID,
        fullName,
        timeStamp: new Date(),
        timeOut: null,
      };

      try {
        await addDoc(collection(db, "attendance"), newAttendance);
        setAttendances((prevAttendances) => [
          ...prevAttendances,
          newAttendance,
        ]);
        setIsAdding(false);
        getAttendances();

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: `Attendance for ${fullName} has been added.`,
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to add attendance.",
          showConfirmButton: true,
        });
      }
    } else if (attendanceFlag === "0") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "attendance"),
        where("PID", "==", PID),
        where("timeStamp", ">=", Timestamp.fromDate(startOfDay)),
        where("timeStamp", "<=", Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return Swal.fire({
          icon: "error",
          title: "Error!",
          text: `No attendance found for PID ${PID} today to update timeOut.`,
          showConfirmButton: true,
        });
      }

      const attendanceDoc = querySnapshot.docs[0];
      //const attendanceData = attendanceDoc.data();
      const attendanceId = attendanceDoc.id;

      try {
        await updateDoc(doc(db, "attendance", attendanceId), {
          timeOut: new Date(),
        });

        setAttendances((prevAttendances) =>
          prevAttendances.map((attendance) =>
            attendance.id === attendanceId
              ? { ...attendance, timeOut: new Date() }
              : attendance
          )
        );

        setIsAdding(false);
        getAttendances();

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: `TimeOut updated for ${fullName}.`,
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to update timeOut.",
          showConfirmButton: true,
        });
      }
    }
  };

  return (
    <div className="small-container">
      <form onSubmit={handleFetchFullName}>
        <h1>TimeSheet</h1>
        <label htmlFor="PID">PID</label>
        <input
          id="PID"
          type="text"
          name="PID"
          value={PID}
          onChange={(e) => setPID(e.target.value)}
        />
        <button
          type="submit"
          style={{
            color: "#ffffff",
            backgroundColor: "#007bff",
            border: "none",
          }}
        >
          Fetch Full Name
        </button>
      </form>
      {fullName && (
        <form onSubmit={handleAdd}>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            value={fullName}
            readOnly
          />
          <label htmlFor="attendanceFlag"></label>
          <p style={{ fontSize: "14px", color: "red" }}>
            (Please enter 1 for time-In and 0 for time-Out)
          </p>
          <input
            id="attendanceFlag"
            type="text"
            name="attendanceFlag"
            value={attendanceFlag}
            onChange={(e) => setAttendanceFlag(e.target.value)}
          />
          <div style={{ marginTop: "30px" }}>
            <input
              type="submit"
              style={{
                color: "#ffffff",
                backgroundColor: "#007bff",
                border: "none",
              }}
              value="Enter"
            />
            <input
              style={{ marginLeft: "12px" }}
              className="muted-button"
              type="button"
              value="Cancel"
              onClick={() => setIsAdding(false)}
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default Add;
