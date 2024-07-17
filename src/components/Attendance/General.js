import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../config/firestore";

const General = ({
  attendances,
  setAttendances,
  setIsAdding,
  setIsViewingGeneral,
  getAttendances,
  setLateLunches,
}) => {
  const [PID, setPID] = useState("");
  const [fullName, setFullName] = useState("");
  const [attendanceFlag, setAttendanceFlag] = useState("");
  const [generalType, setGeneralType] = useState("");

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
      (attendanceFlag !== "1" && attendanceFlag !== "0") ||
      (generalType !== "l" && generalType !== "m")
    ) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required, and attendance flag must be '1' or '0', general type must be 'l' or 'm'.",
        showConfirmButton: true,
      });
    }

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
        text: `No existing attendance record found for PID ${PID} today to update.`,
        showConfirmButton: true,
      });
    }

    const attendanceDoc = querySnapshot.docs[0];
    const attendanceId = attendanceDoc.id;
    const updateData = {};

    if (attendanceFlag === "1") {
      if (generalType === "l") {
        updateData.lunchIn = new Date();
      } else if (generalType === "m") {
        updateData.meetingIn = new Date();
      }
    } else if (attendanceFlag === "0") {
      if (generalType === "l") {
        updateData.lunchOut = new Date();
      } else if (generalType === "m") {
        updateData.meetingOut = new Date();
      }
    }

    try {
      await updateDoc(doc(db, "attendance", attendanceId), updateData);
      console.log("Update successful:", updateData);
    } catch (error) {
      console.error("Error updating document:", error);
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to update record.",
        showConfirmButton: true,
      });
    }

    try {
      setAttendances((prevAttendances) =>
        prevAttendances.map((attendance) =>
          attendance.id === attendanceId
            ? { ...attendance, ...updateData }
            : attendance
        )
      );
    } catch (error) {
      console.error("Error updating attendances state:", error);
    }

    try {
      getAttendances();
      setIsAdding(false);
      setIsViewingGeneral(false);
    } catch (error) {
      console.error(
        "Error refreshing attendances or updating view state:",
        error
      );
    }

    try {
      const updatedAttendance = {
        ...querySnapshot.docs[0].data(),
        ...updateData,
      };

      if (
        updatedAttendance.lunchIn &&
        updatedAttendance.lunchOut &&
        generalType === "l"
      ) {
        const lunchDurationMs =
          updatedAttendance.lunchOut.toDate() -
          updatedAttendance.lunchIn.toDate();
        const minutes = Math.floor(lunchDurationMs / 60000);
        const seconds = Math.floor((lunchDurationMs % 60000) / 1000);

        if (minutes > 1 || (minutes === 1 && seconds > 0)) {
          setLateLunches((prevLateLunches) => [
            ...prevLateLunches,
            {
              PID: updatedAttendance.PID,
              fullName: fullName,
              lunchDuration: `${minutes} min${
                minutes !== 1 ? "s" : ""
              } ${seconds} s`,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error updating late lunches:", error);
    }

    Swal.fire({
      icon: "success",
      title: "Updated!",
      text: `Record updated for ${fullName}.`,
      showConfirmButton: false,
      timer: 1500,
    });
  };

  return (
    <div className="small-container">
      <form onSubmit={handleFetchFullName}>
        <h1>General</h1>
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
          <label htmlFor="generalType"></label>
          <p style={{ fontSize: "14px", color: "red" }}>
            (Please enter 'l' for lunch or 'm' for meeting)
          </p>
          <input
            id="generalType"
            type="text"
            name="generalType"
            value={generalType}
            onChange={(e) => setGeneralType(e.target.value)}
          />
          <label htmlFor="attendanceFlag"></label>
          <p style={{ fontSize: "14px", color: "red" }}>
            (Please enter 1 for Clock-In and 0 for Clock-Out)
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

export default General;
